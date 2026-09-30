import Image from "next/image";
import Link from "next/link";
import { Badge, Price } from "@/components/ui";
import { CATEGORIES, routes } from "@/config/navigation";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { getWishlistIds } from "@/features/wishlist/queries";
import { cardBadge } from "../badges";
import type { ProductCardDTO } from "../types";
import { QuickAdd } from "./QuickAdd";
import s from "./SearchResults.module.scss";

// Decorations aren't in the storefront menu yet (awaiting their design) but can still be found by search.
const CATEGORY_LABEL: Record<string, string> = {
  ...Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label])),
  decorations: "Decorations",
};

/** Search "Live Matches": compact rows (thumb + details + add), so more results fit above the fold than a grid. */
export async function SearchResultList({ products }: { products: ProductCardDTO[] }) {
  const savedIds = await getWishlistIds();
  return (
    <ul className={s.list}>
      {products.map((p, i) => {
        const badge = cardBadge(p);
        return (
          <li key={p.id}>
            <article className={s.row}>
              <div className={s.thumb}>
                <Image src={p.image.url} alt="" fill sizes="104px" priority={i < 3} />
                {badge && (
                  <Badge tone={badge.tone} className={s.badge}>
                    {badge.label}
                  </Badge>
                )}
              </div>
              <div className={s.body}>
                <div className={s.top}>
                  <p className={s.category}>{CATEGORY_LABEL[p.category]}</p>
                  <WishlistButton
                    productId={p.id}
                    productName={p.name}
                    initialSaved={savedIds.includes(p.id)}
                    variant="bar"
                    className={s.wish}
                  />
                </div>
                <h3 className={s.name}>
                  <Link href={routes.product(p.slug)} className={s.link}>
                    {p.name}
                  </Link>
                </h3>
                <p className={s.subtitle}>{p.subtitle}</p>
                <div className={s.buy}>
                  <Price amount={p.price} compareAt={p.compareAtPrice} className={s.price} />
                  <div className={s.add}>
                    <QuickAdd product={p} variant="text" />
                  </div>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/** Suspense fallback with the same row geometry. */
export function SearchResultsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className={s.list} aria-busy="true" aria-label="Searching">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={s.row}>
          <span className={`${s.thumb} ${s.shimmer}`} />
          <span className={s.body}>
            <span className={`${s.skeletonLine} ${s.shimmer}`} />
            <span className={`${s.skeletonLineShort} ${s.shimmer}`} />
          </span>
        </li>
      ))}
    </ul>
  );
}
