import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/config/shop";
import { formatPrice } from "@/lib/format";
import s from "./Checkout.module.scss";

export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/** Totals block used on Bag and Checkout. `collapsible` = <details> on checkout (mobile). */
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
  const rows = (
    <dl className={s.rows}>
      <div>
        <dt>
          Subtotal ({count} {count === 1 ? "item" : "items"})
        </dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div>
        <dt>Shipping</dt>
        <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
      </div>
      <div className={s.total}>
        <dt>Total</dt>
        <dd>{formatPrice(subtotal + shipping)}</dd>
      </div>
    </dl>
  );

  if (!collapsible) return <div className={s.summary}>{rows}</div>;
  return (
    <details className={s.summary}>
      <summary className={s.summaryToggle}>
        <span>Order summary</span>
        <strong>{formatPrice(subtotal + shipping)}</strong>
      </summary>
      {rows}
    </details>
  );
}
