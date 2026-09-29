"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import clsx from "clsx";
import { Button, Icon, Price, Sheet } from "@/components/ui";
import { routes } from "@/config/navigation";
import { addToCart } from "@/features/cart/actions";
import { QuickAddButton } from "@/features/cart/components/QuickAddButton";
import { notifyAddedToBag } from "@/features/cart/notify";
import { formatPrice } from "@/lib/format";
import type { ProductCardDTO } from "../types";
import { useVariantSelection } from "../variant-selection";
import { VariantOptions } from "./VariantOptions";
import s from "./QuickAdd.module.scss";

type Props = { product: ProductCardDTO; variant?: "icon" | "text" };

/**
 * The same "+" on every card. One option → adds straight away. Choices (metal, colour, size) → opens a
 * sheet to pick them, so nobody gets a colour or size they didn't choose. Sold out → disabled.
 */
export function QuickAdd({ product, variant = "icon" }: Props) {
  if (product.quickAddSku) {
    return <QuickAddButton sku={product.quickAddSku} productName={product.name} variant={variant} />;
  }
  if (product.soldOut) {
    return (
      <button type="button" className={clsx(s.trigger, s[variant])} disabled aria-label={`${product.name} is sold out`}>
        {variant === "icon" ? <Icon name="plus" size={20} /> : "Sold out"}
      </button>
    );
  }
  return <QuickAddSheet product={product} variant={variant} />;
}

function QuickAddSheet({ product, variant = "icon" }: Props) {
  const [open, setOpen] = useState(false);
  const [triedWithoutSize, setTriedWithoutSize] = useState(false);
  const sel = useVariantSelection(product.variants);
  const [state, action, pending] = useActionState(
    async (prev: Awaited<ReturnType<typeof addToCart>> | null, fd: FormData) => {
      const res = await addToCart(prev, fd);
      notifyAddedToBag(res, product.name);
      if (res.ok) setOpen(false);
      return res;
    },
    null,
  );
  const formId = `quick-add-${product.id}`;

  return (
    <>
      <button
        type="button"
        className={clsx(s.trigger, s[variant])}
        aria-haspopup="dialog"
        aria-label={`Choose options for ${product.name}`}
        onClick={() => {
          setTriedWithoutSize(false);
          setOpen(true);
        }}
      >
        {variant === "icon" ? (
          <Icon name={state?.ok ? "check" : "plus"} size={20} />
        ) : (
          <>
            <Icon name={state?.ok ? "check" : "plus"} size={18} /> {state?.ok ? "Added" : "Add"}
          </>
        )}
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Choose options"
        footer={
          <Button
            type={sel.missingSize ? "button" : "submit"}
            form={formId}
            fullWidth
            loading={pending}
            disabled={sel.soldOut}
            onClick={sel.missingSize ? () => setTriedWithoutSize(true) : undefined}
          >
            {sel.soldOut
              ? "Sold out"
              : sel.missingSize
                ? "Choose a size"
                : `Add to bag · ${formatPrice(sel.display.price)}`}
          </Button>
        }
      >
        <form id={formId} action={action} className={s.sheet}>
          <input type="hidden" name="sku" value={sel.selected?.sku ?? ""} />
          <div className={s.product}>
            <span className={s.thumb}>
              <Image src={product.image.url} alt="" fill sizes="72px" />
            </span>
            <span className={s.info}>
              <span className={s.name}>{product.name}</span>
              <Price amount={sel.display.price} compareAt={sel.display.compareAtPrice} size="sm" />
              <Link href={routes.product(product.slug)} className={s.details}>
                View details <Icon name="chevronRight" size={16} />
              </Link>
            </span>
          </div>
          <VariantOptions selection={sel} sizeError={triedWithoutSize && sel.missingSize} />
        </form>
      </Sheet>
    </>
  );
}
