import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Badge, Icon, Price } from "@/components/ui";
import { routes } from "@/config/navigation";
import { QuickAddButton } from "@/features/cart/components/QuickAddButton";
import { cardBadge } from "../badges";
import type { ProductCardDTO } from "../types";
import s from "./FeaturedWorks.module.scss";

/**
 * Home "Featured Works" bento: first product is the large tile, the next two stack beside it on md+.
 * Stacked full-width on mobile.
 */
export function FeaturedWorks({ products }: { products: ProductCardDTO[] }) {
  if (products.length === 0) return null;

  return (
    <ul className={s.grid}>
      {products.slice(0, 3).map((p, i) => {
        const large = i === 0;
        const badge = cardBadge(p);
        return (
          <li key={p.id} className={large ? s.large : s.small}>
            <article className={s.tile}>
              <div className={s.media}>
                <Image
                  src={p.image.url}
                  alt=""
                  fill
                  sizes={large ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                  className={s.image}
                />
                {badge && (
                  <Badge tone={badge.tone} className={s.badge}>
                    {badge.label}
                  </Badge>
                )}
              </div>
              <div className={s.body}>
                <div className={s.text}>
                  <h3 className={large ? s.nameLarge : s.name}>
                    <Link href={routes.product(p.slug)} className={s.link}>
                      {p.name}
                    </Link>
                  </h3>
                  <p className={s.subtitle}>{p.subtitle}</p>
                </div>
                <div className={s.buy}>
                  <Price amount={p.price} compareAt={p.compareAtPrice} className={s.price} />
                  {large ? (
                    <span className={s.cta} aria-hidden>
                      Acquire <Icon name="arrowRight" size={16} />
                    </span>
                  ) : (
                    p.quickAddSku && (
                      <div className={s.quickAdd}>
                        <QuickAddButton sku={p.quickAddSku} productName={p.name} />
                      </div>
                    )
                  )}
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/** Suspense fallback with the same geometry as FeaturedWorks. */
export function FeaturedWorksSkeleton() {
  return (
    <ul className={s.grid} aria-busy="true" aria-label="Loading featured pieces">
      {[0, 1, 2].map((i) => (
        <li key={i} className={i === 0 ? s.large : s.small}>
          <div className={clsx(s.tile, s.skeleton)}>
            <div className={s.media} />
            <div className={s.body}>
              <span className={s.skeletonLine} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
