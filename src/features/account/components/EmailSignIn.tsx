"use client";

import { useState, useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import s from "./SignIn.module.scss";

/** Email magic link: one field, then "check your inbox". The link signs in (or signs up) in one tap. */
export function EmailSignIn({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send(to: string) {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.signIn.magicLink({
        email: to,
        callbackURL: next,
        errorCallbackURL: `/login?error=link&next=${encodeURIComponent(next)}`,
      });
      if (error) {
        setError(
          error.status === 429
            ? "Too many attempts. Please wait a minute."
            : "We couldn't send the link. Check the address and try again.",
        );
        return;
      }
      setSentTo(to);
    });
  }

  if (sentTo) {
    return (
      <div key="sent" className={s.step} role="status">
        <span className={s.sentIcon}>
          <Icon name="mail" size={24} />
        </span>
        <p className={s.sentTitle}>Check your inbox</p>
        <p className={s.sentTo}>
          We sent a sign-in link to <strong>{sentTo}</strong>. It works once and expires in 15 minutes.
        </p>
        <div className={s.codeActions}>
          <button type="button" className={s.textButton} onClick={() => setSentTo(null)}>
            Use a different email
          </button>
          <button type="button" className={s.textButton} disabled={pending} onClick={() => send(sentTo)}>
            Resend link
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      key="email"
      className={s.step}
      onSubmit={(e) => {
        e.preventDefault();
        send(email.trim());
      }}
    >
      <label className={s.label} htmlFor="signin-email">
        Email
      </label>
      <div className={s.emailField}>
        <Icon name="mail" size={20} />
        <input
          id="signin-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          required
        />
      </div>
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth loading={pending} iconEnd={<Icon name="arrowRight" size={20} />}>
        Send sign-in link
      </Button>
      <p className={s.note}>No password needed: we email you a secure one-tap link.</p>
    </form>
  );
}
