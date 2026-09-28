import { Fragment, type ReactNode } from "react";
import type { ProductCardDTO } from "../types";
import { ProductCard } from "./ProductCard";
import s from "./ProductGrid.module.scss";

/**
 * 2-col on mobile → 3 → 4. Optionally injects a full-width editorial card
 * after every `insertEvery` products (merchandising slot from the design).
 */
export function ProductGrid({
  products,
  insert,
  insertEvery = 6,
}: {
  products: ProductCardDTO[];
  insert?: ReactNode;
  insertEvery?: number;
}) {
  return (
    <ul className={s.grid}>
      {products.map((p, i) => (
        <Fragment key={p.id}>
          <li>
            <ProductCard product={p} priority={i < 4} />
          </li>
          {insert && (i + 1) % insertEvery === 0 && i < products.length - 1 && <li className={s.fullRow}>{insert}</li>}
        </Fragment>
      ))}
    </ul>
  );
}

export function ProductCarousel({ products, label }: { products: ProductCardDTO[]; label: string }) {
  return (
    <ul className={s.carousel} aria-label={label}>
      {products.map((p) => (
        <li key={p.id} className={s.slide}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
