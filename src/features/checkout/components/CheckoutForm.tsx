"use client";

import { useActionState } from "react";
import { Button, Field, Icon } from "@/components/ui";
import { StickyActionBar } from "@/components/layout";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/config/shop";
import { AddressFields } from "@/features/account/components/AddressFields";
import type { AddressDTO } from "@/features/account/queries";
import { formatPrice } from "@/lib/format";
import { placeOrder, type CheckoutState } from "../actions";
import s from "./Checkout.module.scss";

/**
 * One page, three short cards: contact → delivery → payment. No accordions, no delivery-method choice:
 * every order goes by our courier within Georgia. Prefills from the default saved address.
 */
export function CheckoutForm({
  email,
  defaultAddress,
  total,
  freeDelivery,
}: {
  email?: string;
  defaultAddress?: AddressDTO;
  total: number;
  freeDelivery: boolean;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const values = state.values ?? { email: email ?? "", ...(defaultAddress ?? {}) };

  return (
    <form action={action} className={s.form}>
      <section className={s.step} aria-labelledby="step-contact">
        <h2 id="step-contact" className={s.stepTitle}>
          <span className={s.num}>1</span> Contact
        </h2>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          hint="For your order confirmation"
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

      <section className={s.step} aria-labelledby="step-payment">
        <h2 id="step-payment" className={s.stepTitle}>
          <span className={s.num}>3</span> Payment
        </h2>
        <p className={s.note}>
          <Icon name="lock" size={18} />
          After you place the order you&apos;ll pay by card on our bank&apos;s secure page.
        </p>
      </section>

      {state.message && (
        <p className={s.error} role="alert">
          {state.message}
        </p>
      )}

      <StickyActionBar>
        <Button type="submit" fullWidth loading={pending} iconEnd={<Icon name="lock" size={18} />}>
          Place order · {formatPrice(total)}
        </Button>
      </StickyActionBar>
    </form>
  );
}
