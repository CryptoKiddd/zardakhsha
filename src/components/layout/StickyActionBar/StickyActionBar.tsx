import s from "./StickyActionBar.module.scss";

/**
 * Bottom ACTION bar (Add to Cart / Checkout / Pay). Not navigation.
 * Allowed only on Product, Bag and Checkout screens.
 * Pages using it must wrap content in <WithActionBar> so nothing hides behind it.
 */
export function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.bar}>
      <div className={s.inner}>{children}</div>
    </div>
  );
}

export function WithActionBar({ children }: { children: React.ReactNode }) {
  return <div className={s.spacer}>{children}</div>;
}
