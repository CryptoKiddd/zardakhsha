"use client";

import { useActionState } from "react";
import { Button, Icon, IconButton } from "@/components/ui";
import { addToCart } from "../actions";
import { notifyAddedToBag } from "../notify";
import type { ActionResult } from "../types";
import s from "./QuickAddButton.module.scss";

/**
 * The quick "+" add-to-bag on cards and search rows. Works without JS (plain form post), enhanced with pending state.
 * `icon`: square "+" (cards). `text`: labeled "+ Add" (search rows, where there is room for a word).
 */
export function QuickAddButton({
  sku,
  productName,
  variant = "icon",
}: {
  sku: string;
  productName: string;
  variant?: "icon" | "text";
}) {
  const [state, action, pending] = useActionState(async (prev: ActionResult | null, fd: FormData) => {
    const res = await addToCart(prev, fd);
    notifyAddedToBag(res, productName);
    return res;
  }, null);
  const icon = state?.ok ? "check" : "plus";

  return (
    <form action={action} className={s.form}>
      <input type="hidden" name="sku" value={sku} />
      {variant === "icon" ? (
        <IconButton
          type="submit"
          icon={icon}
          label={`Add ${productName} to bag`}
          disabled={pending}
          className={s.button}
        />
      ) : (
        <Button
          type="submit"
          size="md"
          loading={pending}
          iconStart={<Icon name={icon} size={18} />}
          aria-label={`Add ${productName} to bag`}
          className={s.textButton}
        >
          {state?.ok ? "Added" : "Add"}
        </Button>
      )}
    </form>
  );
}
