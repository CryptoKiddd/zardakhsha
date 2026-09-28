import clsx from "clsx";
import { Icon } from "../Icon/Icon";
import s from "./Rating.module.scss";

export function Rating({
  value,
  count,
  size = 14,
  compact = false,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  /** One star + "4.9 (128)": for cards where five stars are too wide. */
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <span className={clsx(s.rating, className)}>
        <span className={s.stars} aria-hidden>
          <Icon name="star" size={size} filled />
        </span>
        <span className="visually-hidden">
          Rated {value.toFixed(1)} out of 5{count != null ? `, ${count} reviews` : ""}
        </span>
        <span className={s.value} aria-hidden>
          {value.toFixed(1)}
          {count != null && <span className={s.count}> ({count})</span>}
        </span>
      </span>
    );
  }

  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={clsx(s.rating, className)}>
      <span className={s.stars} aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon key={i} name="star" size={size} filled={i <= Math.round(rounded)} />
        ))}
      </span>
      <span className="visually-hidden">
        Rated {value.toFixed(1)} out of 5{count != null ? `, ${count} reviews` : ""}
      </span>
      {count != null && (
        <span className={s.count} aria-hidden>
          {value.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}
