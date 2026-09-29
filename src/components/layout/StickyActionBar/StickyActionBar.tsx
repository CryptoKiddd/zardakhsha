import s from "./StickyActionBar.module.scss";

/**
 * Bottom ACTION bar (Add to Cart / Checkout / Pay). Not navigation.
 * Allowed only on Product, Bag and Checkout screens.
 * Pages using it must wrap content in <WithActionBar> so nothing hides behind it.
 */
export function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    // data-action-bar lets toasts float above this bar instead of covering the main button.
    <div className={s.bar} data-action-bar>
      <div className={s.inner}>{children}</div>
    </div>
  );
}

export function WithActionBar({ children }: { children: React.ReactNode }) {
  return <div className={s.spacer}>{children}</div>;
}
