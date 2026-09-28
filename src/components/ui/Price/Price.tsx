import clsx from "clsx";
import { formatPrice } from "@/lib/format";
import s from "./Price.module.scss";

export function Price({
  amount,
  compareAt,
  size = "md",
  className,
}: {
  amount: number;
  /** Original price. Shown struck through when higher than `amount`. */
  compareAt?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const onSale = compareAt != null && compareAt > amount;
  return (
    <p className={clsx(s.price, s[size], className)}>
      <span className={clsx(onSale && s.sale)}>
        {onSale && <span className="visually-hidden">Sale price </span>}
        {formatPrice(amount)}
      </span>
      {onSale && (
        <s className={s.compare}>
          <span className="visually-hidden">Original price </span>
          {formatPrice(compareAt)}
        </s>
      )}
    </p>
  );
}
