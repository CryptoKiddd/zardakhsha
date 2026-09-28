import s from "./ProductGridSkeleton.module.scss";

/** Suspense fallback with the same geometry as ProductGrid/ProductCarousel (no layout shift). */
export function ProductGridSkeleton({ count = 4, carousel = false }: { count?: number; carousel?: boolean }) {
  return (
    <ul className={carousel ? s.carousel : s.grid} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={s.card}>
          <span className={s.image} />
          <span className={s.line} />
          <span className={s.lineShort} />
          <span className={s.lineButton} />
        </li>
      ))}
    </ul>
  );
}
