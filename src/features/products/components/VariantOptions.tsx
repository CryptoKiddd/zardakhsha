"use client";

import clsx from "clsx";
import { Icon, Swatch } from "@/components/ui";
import { METAL_LABEL, RING_SIZE_MM, type VariantSelection } from "../variant-selection";
import s from "./VariantOptions.module.scss";

/** Metal tiles, enamel swatch tiles and size tiles (from the Stitch product screen). */
export function VariantOptions({
  selection: sel,
  onSizeGuide,
  sizeError,
}: {
  selection: VariantSelection;
  /** Shows a "Size guide" link next to the size heading. */
  onSizeGuide?: () => void;
  /** Highlights the size group after someone tried to add without choosing. */
  sizeError?: boolean;
}) {
  return (
    <div className={s.options}>
      {sel.metals.length > 1 && (
        <fieldset className={s.group}>
          <legend className={s.legend}>
            Metal <span>{METAL_LABEL[sel.metal]}</span>
          </legend>
          <div className={s.metals}>
            {sel.metals.map((m) => (
              <button
                key={m}
                type="button"
                className={s.metal}
                aria-pressed={m === sel.metal}
                onClick={() => sel.setMetal(m)}
              >
                <Swatch color={m === "gold" ? "var(--color-gold)" : "var(--color-silver)"} label="" size="sm" />
                {METAL_LABEL[m]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {sel.colors.length > 1 && (
        <fieldset className={s.group}>
          <legend className={s.legend}>
            Enamel <span>{sel.color}</span>
          </legend>
          <div className={s.swatches}>
            {sel.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                className={s.swatch}
                aria-label={c.name}
                aria-pressed={c.name === sel.color}
                onClick={() => sel.setColor(c.name)}
                style={{ "--swatch": c.hex } as React.CSSProperties}
              >
                {c.name === sel.color && <Icon name="check" size={16} />}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {sel.needsSize && <SizeOptions selection={sel} onSizeGuide={onSizeGuide} sizeError={sizeError} />}
    </div>
  );
}

/** Size tiles with circumference; also used on its own in the "Choose your size" sheet. */
export function SizeOptions({
  selection: sel,
  onSizeGuide,
  sizeError,
}: {
  selection: VariantSelection;
  onSizeGuide?: () => void;
  sizeError?: boolean;
}) {
  return (
    <fieldset className={clsx(s.group, sizeError && s.groupError)}>
      <legend className={s.legendRow}>
        <span className={s.legend}>
          Ring size (US) <span>{sel.size ?? "Choose one"}</span>
        </span>
        {onSizeGuide && (
          <button type="button" className={s.guideLink} onClick={onSizeGuide}>
            <Icon name="ruler" size={18} /> Size guide
          </button>
        )}
      </legend>
      <div className={s.sizes}>
        {sel.sizes.map((v) => (
          <button
            key={v.sku}
            type="button"
            className={s.size}
            aria-pressed={v.size === sel.size}
            disabled={v.stock === 0}
            aria-label={`Size ${v.size}${v.stock === 0 ? ", sold out" : ""}`}
            onClick={() => sel.setSize(v.size)}
          >
            <span className={s.sizeNum}>{v.size}</span>
            {v.size && RING_SIZE_MM[v.size] && <span className={s.sizeMm}>{RING_SIZE_MM[v.size]} mm</span>}
          </button>
        ))}
      </div>
      {sizeError && (
        <p className={s.error} role="alert">
          Choose your size to add it to the bag.
        </p>
      )}
    </fieldset>
  );
}
