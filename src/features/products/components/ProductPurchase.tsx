"use client";

import { useActionState, useState } from "react";
import { Button, Icon, Price, Sheet } from "@/components/ui";
import { StickyActionBar } from "@/components/layout";
import { LOW_STOCK_AT } from "@/config/shop";
import { addToCart } from "@/features/cart/actions";
import { notifyAddedToBag } from "@/features/cart/notify";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { formatPrice } from "@/lib/format";
import type { ProductDetailDTO } from "../types";
import { formatDimensions, useVariantSelection } from "../variant-selection";
import { SizeOptions, VariantOptions } from "./VariantOptions";
import s from "./ProductPurchase.module.scss";

const FORM_ID = "product-purchase";

/**
 * Variant selection + add to bag. When a size is still missing, the bar's button ("Select a size") opens the
 * size sheet instead of doing nothing; the sheet is also the size guide, and adds to the bag from there.
 */
export function ProductPurchase({ product, saved }: { product: ProductDetailDTO; saved: boolean }) {
  const sel = useVariantSelection(product.variants);
  const [sizeSheetOpen, setSizeSheetOpen] = useState(false);
  const [, action, pending] = useActionState(
    async (prev: Awaited<ReturnType<typeof addToCart>> | null, fd: FormData) => {
      const res = await addToCart(prev, fd);
      notifyAddedToBag(res, product.name);
      if (res.ok) setSizeSheetOpen(false);
      return res;
    },
    null,
  );

  const cta = sel.soldOut ? "Sold out" : sel.missingSize ? "Select a size" : "Add to Bag";

  return (
    <form id={FORM_ID} action={action} className={s.purchase}>
      <input type="hidden" name="sku" value={sel.selected?.sku ?? ""} />

      <Price amount={sel.display.price} compareAt={sel.display.compareAtPrice} size="lg" className={s.price} />

      <VariantOptions selection={sel} onSizeGuide={() => setSizeSheetOpen(true)} />

      {(sel.display.dimensions || sel.display.weightGrams) && (
        <dl className={s.specs}>
          {sel.display.dimensions && (
            <div>
              <dt>
                <Icon name="ruler" size={18} /> Size
              </dt>
              <dd>{formatDimensions(sel.display.dimensions)}</dd>
            </div>
          )}
          {sel.display.weightGrams && (
            <div>
              <dt>Weight</dt>
              <dd>{sel.display.weightGrams} g</dd>
            </div>
          )}
        </dl>
      )}

      {sel.selected && sel.selected.stock > 0 && sel.selected.stock <= LOW_STOCK_AT && (
        <p className={s.lowStock}>
          <span className={s.pulse} aria-hidden /> Only {sel.selected.stock} left, handmade in small batches
        </p>
      )}

      <StickyActionBar>
        <Price amount={sel.display.price} compareAt={sel.display.compareAtPrice} className={s.barPrice} />
        <Button
          type={sel.missingSize ? "button" : "submit"}
          fullWidth
          loading={pending}
          disabled={sel.soldOut}
          onClick={sel.missingSize ? () => setSizeSheetOpen(true) : undefined}
          iconEnd={sel.missingSize ? <Icon name="chevronDown" size={18} /> : undefined}
        >
          {cta}
        </Button>
        <WishlistButton productId={product.id} productName={product.name} initialSaved={saved} variant="bar" />
      </StickyActionBar>

      {sel.needsSize && (
        <Sheet
          open={sizeSheetOpen}
          onClose={() => setSizeSheetOpen(false)}
          title="Choose your size"
          footer={
            <Button type="submit" form={FORM_ID} fullWidth loading={pending} disabled={sel.missingSize || sel.soldOut}>
              {sel.missingSize ? "Tap a size above" : `Add to bag · ${formatPrice(sel.display.price)}`}
            </Button>
          }
        >
          <div className={s.sizeSheet}>
            <SizeOptions selection={sel} />
            <section className={s.measure} aria-labelledby="measure-title">
              <h3 id="measure-title" className={s.measureTitle}>
                <Icon name="ruler" size={20} /> How to measure
              </h3>
              <ol className={s.steps}>
                <li>Wrap a strip of paper snugly around the base of your finger.</li>
                <li>Mark where it overlaps, then lay it flat and measure in mm.</li>
                <li>Pick the size whose mm is closest. Between two? Choose the larger.</li>
              </ol>
              <p className={s.measureNote}>Free resizing within 30 days if it doesn&apos;t fit.</p>
            </section>
          </div>
        </Sheet>
      )}
    </form>
  );
}
