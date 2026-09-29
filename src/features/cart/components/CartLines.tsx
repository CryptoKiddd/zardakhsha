"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { IconButton, Price, toast } from "@/components/ui";
import { routes } from "@/config/navigation";
import { setLineQuantity } from "../actions";
import type { CartLineDTO } from "../types";
import s from "./CartLines.module.scss";

type Update = { sku: string; quantity: number };

/**
 * useOptimistic: the quantity/removal shows instantly, the Server Action runs
 * in a transition, and React reconciles with the real server data when it returns.
 */
export function CartLines({ lines }: { lines: CartLineDTO[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, applyOptimistic] = useOptimistic(lines, (state, { sku, quantity }: Update) =>
    quantity === 0 ? state.filter((l) => l.sku !== sku) : state.map((l) => (l.sku === sku ? { ...l, quantity } : l)),
  );

  function update(sku: string, quantity: number) {
    startTransition(async () => {
      applyOptimistic({ sku, quantity });
      const res = await setLineQuantity(sku, quantity);
      if (!res.ok) toast.error(res.message, { id: "bag-line" });
    });
  }

  // Quantity steps stay silent (the number changing is feedback enough); removal gets an Undo.
  function remove(line: CartLineDTO) {
    update(line.sku, 0);
    toast("Removed from bag", {
      id: "bag-line",
      description: line.name,
      action: { label: "Undo", onClick: () => update(line.sku, line.quantity) },
    });
  }

  return (
    <ul className={s.list} aria-busy={isPending}>
      {optimistic.map((line) => (
        <li key={line.sku} className={s.line}>
          <Link href={routes.product(line.slug)} className={s.thumb} tabIndex={-1} aria-hidden>
            <Image src={line.image.url} alt="" fill sizes="104px" />
          </Link>
          <div className={s.info}>
            <div className={s.top}>
              <Link href={routes.product(line.slug)} className={s.name}>
                {line.name}
              </Link>
              <IconButton
                icon="trash"
                label={`Remove ${line.name} from bag`}
                onClick={() => remove(line)}
                className={s.remove}
              />
            </div>
            <p className={s.variant}>{line.variantLabel}</p>
            <div className={s.controls}>
              <div className={s.stepper} role="group" aria-label={`Quantity for ${line.name}`}>
                <IconButton
                  icon="minus"
                  label="Decrease quantity"
                  onClick={() => update(line.sku, line.quantity - 1)}
                />
                <output className={s.qty} aria-live="polite">
                  {line.quantity}
                </output>
                <IconButton
                  icon="plus"
                  label="Increase quantity"
                  disabled={line.quantity >= Math.min(line.stock, 10)}
                  onClick={() => update(line.sku, line.quantity + 1)}
                />
              </div>
              <Price
                amount={line.price * line.quantity}
                compareAt={line.compareAtPrice && line.compareAtPrice * line.quantity}
                className={s.price}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
