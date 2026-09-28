"use client";

import { useActionState } from "react";
import { Button, Field, Icon } from "@/components/ui";
import { StickyActionBar } from "@/components/layout";
import { AddressFields } from "@/features/account/components/AddressFields";
import type { AddressDTO } from "@/features/account/queries";
import { formatPrice } from "@/lib/format";
import { placeOrder, type CheckoutState } from "../actions";
import s from "./Checkout.module.scss";

/** Single-page checkout: contact → delivery → payment. Prefills from the default saved address. */
export function CheckoutForm({
  email,
  defaultAddress,
  total,
}: {
  email?: string;
  defaultAddress?: AddressDTO;
  total: number;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const values = state.values ?? { email: email ?? "", ...(defaultAddress ?? {}) };

  return (
    <form action={action} className={s.form}>
      <section className={s.step}>
        <h2 className={s.stepTitle}>
          <span className={s.num}>1</span> Contact
        </h2>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values.email}
          error={state.errors?.email}
          required
        />
      </section>

      <section className={s.step}>
        <h2 className={s.stepTitle}>
          <span className={s.num}>2</span> Delivery
        </h2>
        <AddressFields errors={state.errors} values={values} />
      </section>

      <section className={s.step}>
        <h2 className={s.stepTitle}>
          <span className={s.num}>3</span> Payment
        </h2>
        <p className={s.note}>
          <Icon name="lock" size={16} /> You&apos;ll be taken to our secure payment page to pay by card, Apple Pay or
          Google Pay.
        </p>
      </section>

      {state.message && (
        <p className={s.error} role="alert">
          {state.message}
        </p>
      )}

      <StickyActionBar>
        <Button type="submit" fullWidth loading={pending}>
          Pay {formatPrice(total)}
        </Button>
      </StickyActionBar>
    </form>
  );
}
