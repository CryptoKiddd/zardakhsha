"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { IconButton, Price } from "@/components/ui";
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
      await setLineQuantity(sku, quantity);
    });
  }

  return (
    <ul className={s.list} aria-busy={isPending}>
      {optimistic.map((line) => (
        <li key={line.sku} className={s.line}>
          <Link href={routes.product(line.slug)} className={s.thumb}>
            <Image src={line.image.url} alt={line.image.alt} fill sizes="96px" />
          </Link>
          <div className={s.info}>
            <Link href={routes.product(line.slug)} className={s.name}>
              {line.name}
            </Link>
            <p className={s.variant}>{line.variantLabel}</p>
            <Price
              amount={line.price * line.quantity}
              compareAt={line.compareAtPrice && line.compareAtPrice * line.quantity}
              size="sm"
            />
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
              <button type="button" className={s.remove} onClick={() => update(line.sku, 0)}>
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
