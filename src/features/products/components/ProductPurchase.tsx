"use client";

import { useActionState, useMemo, useState } from "react";
import { Button, Chip, IconButton, Price, Sheet, Swatch } from "@/components/ui";
import { StickyActionBar } from "@/components/layout";
import { LOW_STOCK_AT } from "@/config/shop";
import { addToCart } from "@/features/cart/actions";
import type { Metal, ProductDetailDTO, VariantDTO } from "../types";
import s from "./ProductPurchase.module.scss";

const METAL_LABEL: Record<Metal, string> = { silver: "Sterling Silver", gold: "Gold-plated" };

function unique<T>(items: T[], key: (t: T) => string): T[] {
  return [...new Map(items.map((i) => [key(i), i])).values()];
}

/**
 * Variant selection (metal → enamel color → size) + add to bag.
 * Selection lives in local state; the add runs as a Server Action via useActionState,
 * which gives us pending + result state without any extra store.
 */
export function ProductPurchase({ product }: { product: ProductDetailDTO }) {
  const { variants } = product;
  const first = variants.find((v) => v.stock > 0) ?? variants[0]!;

  const [metal, setMetal] = useState<Metal>(first.metal);
  const [color, setColor] = useState(first.enamelColor.name);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addToCart, null);

  const metals = unique(variants, (v) => v.metal).map((v) => v.metal);
  const colors = unique(
    variants.filter((v) => v.metal === metal),
    (v) => v.enamelColor.name,
  ).map((v) => v.enamelColor);
  const sizes = variants.filter((v) => v.metal === metal && v.enamelColor.name === color && v.size);
  const needsSize = sizes.length > 0;

  const selected: VariantDTO | undefined = useMemo(
    () =>
      variants.find((v) => v.metal === metal && v.enamelColor.name === color && (needsSize ? v.size === size : true)),
    [variants, metal, color, size, needsSize],
  );

  const display = selected ?? variants.find((v) => v.metal === metal && v.enamelColor.name === color) ?? first;
  const soldOut = selected ? selected.stock === 0 : false;
  const cta = needsSize && !size ? "Select a size" : soldOut ? "Sold out" : "Add to Bag";

  return (
    <form action={formAction} className={s.purchase}>
      <input type="hidden" name="sku" value={selected?.sku ?? ""} />

      <Price amount={display.price} compareAt={display.compareAtPrice} size="lg" />

      <fieldset className={s.group}>
        <legend className={s.legend}>
          Metal: <strong>{METAL_LABEL[metal]}</strong>
        </legend>
        <div className={s.options}>
          {metals.map((m) => (
            <Chip
              key={m}
              selected={m === metal}
              onClick={() => {
                setMetal(m);
                // keep the color if it exists in the new metal, otherwise pick the first
                const next = variants.find((v) => v.metal === m && v.enamelColor.name === color);
                if (!next) setColor(variants.find((v) => v.metal === m)!.enamelColor.name);
              }}
            >
              <Swatch color={m === "gold" ? "var(--color-gold)" : "var(--color-silver)"} label="" size="sm" />
              {METAL_LABEL[m]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className={s.group}>
        <legend className={s.legend}>
          Enamel: <strong>{color}</strong>
        </legend>
        <div className={s.options}>
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              className={s.swatchButton}
              aria-label={c.name}
              aria-pressed={c.name === color}
              onClick={() => setColor(c.name)}
            >
              <Swatch color={c.hex} label={c.name} selected={c.name === color} />
            </button>
          ))}
        </div>
      </fieldset>

      {needsSize && (
        <fieldset className={s.group}>
          <legend className={s.legendRow}>
            <span>
              Size: <strong>{size ?? "Select"}</strong>
            </span>
            <button type="button" className={s.link} onClick={() => setSizeGuideOpen(true)}>
              Size guide
            </button>
          </legend>
          <div className={s.options}>
            {sizes.map((v) => (
              <Chip key={v.sku} selected={v.size === size} disabled={v.stock === 0} onClick={() => setSize(v.size)}>
                {v.size}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}

      {selected && selected.stock > 0 && selected.stock <= LOW_STOCK_AT && (
        <p className={s.lowStock}>Only {selected.stock} left, handmade in small batches</p>
      )}

      <p className={state?.ok === false ? s.error : s.status} role="status" aria-live="polite">
        {state?.message}
      </p>

      <StickyActionBar>
        <Price amount={display.price} compareAt={display.compareAtPrice} className={s.barPrice} />
        <Button type="submit" fullWidth loading={pending} disabled={!selected || soldOut}>
          {cta}
        </Button>
        <IconButton icon="heart" label="Save to wishlist" />
      </StickyActionBar>

      <Sheet open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} title="Ring size guide">
        <p className={s.guide}>
          Wrap a strip of paper around your finger, mark where it overlaps and measure the length in mm.
        </p>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Size</th>
              <th>Circumference</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["5", "49.3 mm"],
              ["6", "51.9 mm"],
              ["7", "54.4 mm"],
              ["8", "57.0 mm"],
              ["9", "59.5 mm"],
            ].map(([sz, mm]) => (
              <tr key={sz}>
                <td>{sz}</td>
                <td>{mm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>
    </form>
  );
}
