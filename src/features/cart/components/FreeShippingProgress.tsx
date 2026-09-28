import { FREE_SHIPPING_THRESHOLD } from "@/config/shop";
import { formatPrice } from "@/lib/format";
import s from "./FreeShippingProgress.module.scss";

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className={s.wrap}>
      <p className={s.text}>
        {remaining > 0 ? (
          <>
            You&apos;re <strong>{formatPrice(remaining)}</strong> away from free shipping
          </>
        ) : (
          <strong>You&apos;ve unlocked free shipping</strong>
        )}
      </p>
      <progress className={s.bar} value={pct} max={100} aria-label="Progress to free shipping" />
    </div>
  );
}
