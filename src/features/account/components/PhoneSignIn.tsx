"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import { DEFAULT_COUNTRY_CODE, normalizePhone, OTP_RESEND_COOLDOWN_S, PHONE_OTP_LENGTH } from "@/config/auth";
import { authClient } from "@/lib/auth-client";
import s from "./SignIn.module.scss";

/**
 * Two-step funnel: phone number → 6-digit SMS code. The first correct code also creates the account,
 * so there is no separate "sign up". The code field is one input (autocomplete="one-time-code", so iOS/Android
 * offer the SMS code from the keyboard) drawn as six boxes, and it submits itself on the last digit.
 */
export function PhoneSignIn({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [input, setInput] = useState("");
  const [phone, setPhone] = useState(""); // E.164 of the number the code was sent to
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();
  const codeInput = useRef<HTMLInputElement>(null);

  // Resend countdown: a timer is a browser side effect, which is what effects are for.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function sendCode(to: string) {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: to });
      if (error) {
        setError(
          error.status === 429 ? "Too many attempts. Please wait a minute." : "We couldn't send the code. Try again.",
        );
        return;
      }
      setPhone(to);
      setCode("");
      setStep("code");
      setCooldown(OTP_RESEND_COOLDOWN_S);
    });
  }

  function verify(value: string) {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.phoneNumber.verify({ phoneNumber: phone, code: value });
      if (error) {
        setError(
          error.status === 403
            ? "Too many wrong codes. Send a new one."
            : "That code isn't right. Check the SMS and try again.",
        );
        setCode("");
        codeInput.current?.focus();
        return;
      }
      router.replace(next as "/account");
      router.refresh(); // header + account now render signed in
    });
  }

  if (step === "phone") {
    return (
      <form
        key="phone"
        className={s.step}
        onSubmit={(e) => {
          e.preventDefault();
          const e164 = normalizePhone(input);
          if (!e164) setError("Enter your mobile number, e.g. 555 12 34 56");
          else sendCode(e164);
        }}
      >
        <label className={s.label} htmlFor="signin-phone">
          Mobile number
        </label>
        <div className={s.phoneField} data-invalid={error ? true : undefined}>
          <span className={s.prefix} aria-hidden>
            {DEFAULT_COUNTRY_CODE}
          </span>
          <input
            id="signin-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="555 12 34 56"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby="signin-phone-note"
            required
          />
        </div>
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth loading={pending} iconEnd={<Icon name="arrowRight" size={20} />}>
          Send code
        </Button>
        <p id="signin-phone-note" className={s.note}>
          We&apos;ll text you a {PHONE_OTP_LENGTH}-digit code. New here? The code creates your account.
        </p>
      </form>
    );
  }

  return (
    <form
      key="code"
      className={s.step}
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === PHONE_OTP_LENGTH) verify(code);
      }}
    >
      <p className={s.sentTo}>
        Enter the code we sent to <strong>{phone}</strong>
      </p>
      <label className="visually-hidden" htmlFor="signin-code">
        {PHONE_OTP_LENGTH}-digit code
      </label>
      <div className={s.otp}>
        <input
          ref={codeInput}
          id="signin-code"
          className={s.otpInput}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern={`\\d{${PHONE_OTP_LENGTH}}`}
          maxLength={PHONE_OTP_LENGTH}
          value={code}
          autoFocus
          disabled={pending}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, PHONE_OTP_LENGTH);
            setCode(digits);
            if (digits.length === PHONE_OTP_LENGTH) verify(digits);
          }}
        />
        {/* The six boxes are a picture of the one real input above. */}
        <div className={s.otpBoxes} aria-hidden>
          {Array.from({ length: PHONE_OTP_LENGTH }, (_, i) => (
            <span
              key={i}
              className={s.otpBox}
              data-filled={i < code.length || undefined}
              data-active={i === code.length || undefined}
            >
              {code[i] ?? ""}
            </span>
          ))}
        </div>
      </div>
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth loading={pending} disabled={code.length < PHONE_OTP_LENGTH}>
        Sign in
      </Button>
      <div className={s.codeActions}>
        <button type="button" className={s.textButton} onClick={() => setStep("phone")}>
          Change number
        </button>
        <button
          type="button"
          className={s.textButton}
          disabled={cooldown > 0 || pending}
          onClick={() => sendCode(phone)}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}
