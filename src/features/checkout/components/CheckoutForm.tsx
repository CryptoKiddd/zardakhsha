"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button, Field, Icon } from "@/components/ui";
import { StickyActionBar } from "@/components/layout";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/config/shop";
import { AddressFields } from "@/features/account/components/AddressFields";
import type { AddressDTO } from "@/features/account/queries";
import { formatPrice } from "@/lib/format";
import { placeOrder, type CheckoutState } from "../actions";
import s from "./Checkout.module.scss";

/**
 * Two short cards (contact, delivery), prefilled from the account. The Pay button unlocks once every
 * required field is valid, then sends the customer to Bank of Georgia's payment page.
 */
export function CheckoutForm({
  email,
  phone,
  defaultAddress,
  total,
  freeDelivery,
}: {
  email?: string;
  /** Phone the customer signed in with, used when there's no saved address yet. */
  phone?: string;
  defaultAddress?: AddressDTO;
  total: number;
  freeDelivery: boolean;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const values = state.values ?? { email: email ?? "", phone: phone ?? "", ...(defaultAddress ?? {}) };
  const form = useRef<HTMLFormElement>(null);
  const [complete, setComplete] = useState(false);

  // Read the browser's own validity (required, email, phone pattern). Prefilled/autofilled forms can be
  // complete before anyone types, so check once on mount too; after that, every input re-checks.
  const check = () => setComplete(form.current?.checkValidity() ?? false);
  useEffect(check, [state]);

  return (
    <form ref={form} action={action} className={s.form} onInput={check} onChange={check}>
      <section className={s.step} aria-labelledby="step-contact">
        <h2 id="step-contact" className={s.stepTitle}>
          <span className={s.num}>1</span> Contact
        </h2>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          hint="For your receipt and order updates"
          defaultValue={values.email}
          error={state.errors?.email}
          required
        />
      </section>

      <section className={s.step} aria-labelledby="step-delivery">
        <h2 id="step-delivery" className={s.stepTitle}>
          <span className={s.num}>2</span> Delivery
        </h2>
        <AddressFields errors={state.errors} values={values} />
        <p className={s.delivery}>
          <Icon name="truck" size={20} />
          <span>
            <strong>Courier delivery in Georgia</strong>
            <span>
              {freeDelivery
                ? "Free for this order"
                : `${formatPrice(SHIPPING_FEE)}, free over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}
              . The courier calls before arriving.
            </span>
          </span>
        </p>
      </section>

      {state.message && (
        <p className={s.error} role="alert">
          {state.message}
        </p>
      )}

      <StickyActionBar>
        <div className={s.pay}>
          <Button
            type="submit"
            fullWidth
            loading={pending}
            disabled={!complete}
            iconStart={complete ? <Icon name="lock" size={18} /> : undefined}
          >
            {complete ? `Pay ${formatPrice(total)}` : "Complete your details"}
          </Button>
          {/* A failed attempt is explained right under the button, where the customer is looking. */}
          <p className={state.message ? s.payError : s.payNote}>
            {state.message ??
              (complete ? "Secure payment by Bank of Georgia" : "Fill in the required fields to continue")}
          </p>
        </div>
      </StickyActionBar>
    </form>
  );
}
