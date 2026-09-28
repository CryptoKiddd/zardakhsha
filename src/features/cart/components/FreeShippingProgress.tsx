import { Icon } from "@/components/ui";
import { FREE_SHIPPING_THRESHOLD } from "@/config/shop";
import { formatPrice } from "@/lib/format";
import s from "./FreeShippingProgress.module.scss";

/** "₾21 away from free delivery" nudge with a progress bar. */
export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className={s.wrap} data-unlocked={remaining === 0 || undefined}>
      <p className={s.text}>
        <Icon name="truck" size={20} className={s.icon} />
        {remaining > 0 ? (
          <span>
            <strong className={s.amount}>{formatPrice(remaining)}</strong> away from free courier delivery
          </span>
        ) : (
          <strong>You&apos;ve unlocked free courier delivery</strong>
        )}
      </p>
      <progress className={s.bar} value={pct} max={100} aria-label="Progress to free delivery" />
      <p className={s.meta}>
        <span>Your bag: {formatPrice(subtotal)}</span>
        <span>Free from {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
      </p>
    </div>
  );
}
