"use client";

import { useActionState } from "react";
import { IconButton } from "@/components/ui";
import { addToCart } from "../actions";
import s from "./QuickAddButton.module.scss";

/** The "+" on product cards. Works without JS (plain form post), enhanced with pending state. */
export function QuickAddButton({ sku, productName }: { sku: string; productName: string }) {
  const [state, action, pending] = useActionState(addToCart, null);

  return (
    <form action={action} className={s.form}>
      <input type="hidden" name="sku" value={sku} />
      <IconButton
        type="submit"
        icon={state?.ok ? "check" : "plus"}
        label={`Add ${productName} to bag`}
        disabled={pending}
        className={s.button}
      />
      <span className="visually-hidden" role="status">
        {state?.message}
      </span>
    </form>
  );
}
