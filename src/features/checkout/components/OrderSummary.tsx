import { Icon } from "@/components/ui";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/config/shop";
import { formatPrice } from "@/lib/format";
import s from "./Checkout.module.scss";

export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/** Totals block used on Bag and Checkout. `collapsible` = <details> on checkout, closed by default. */
export function OrderSummary({
  subtotal,
  count,
  collapsible,
}: {
  subtotal: number;
  count: number;
  collapsible?: boolean;
}) {
  const shipping = shippingFor(subtotal);
  const items = `${count} ${count === 1 ? "item" : "items"}`;
  const rows = (
    <dl className={s.rows}>
      <div>
        <dt>Subtotal ({items})</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div>
        <dt>Courier delivery</dt>
        <dd className={shipping === 0 ? s.free : undefined}>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
      </div>
      <div className={s.total}>
        <dt>Total</dt>
        <dd>{formatPrice(subtotal + shipping)}</dd>
      </div>
    </dl>
  );

  if (!collapsible) {
    return (
      <section className={s.summary} aria-labelledby="summary-title">
        <h2 id="summary-title" className={s.summaryTitle}>
          Summary
        </h2>
        {rows}
      </section>
    );
  }
  return (
    <details className={s.summary}>
      <summary className={s.summaryToggle}>
        <span className={s.summaryIcon}>
          <Icon name="bag" size={20} />
        </span>
        <span className={s.summaryLabel}>
          <strong>Order summary</strong>
          <span>{items}</span>
        </span>
        <strong className={s.summaryTotal}>{formatPrice(subtotal + shipping)}</strong>
        <Icon name="chevronDown" size={20} className={s.chevron} />
      </summary>
      {rows}
    </details>
  );
}
