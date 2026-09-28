import Image from "next/image";
import Link from "next/link";
import { Badge, Price, Rating, SwatchRow } from "@/components/ui";
import { routes } from "@/config/navigation";
import { QuickAddButton } from "@/features/cart/components/QuickAddButton";
import { cardBadge } from "../badges";
import type { ProductCardDTO } from "../types";
import s from "./ProductCard.module.scss";

/**
 * THE product card: used in grids, carousels and "complete the look".
 * Server Component; only the quick-add button is interactive.
 */
export function ProductCard({ product, priority = false }: { product: ProductCardDTO; priority?: boolean }) {
  const badge = cardBadge(product);

  return (
    <article className={s.card}>
      <div className={s.media}>
        <Image
          src={product.image.url}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 66vw"
          priority={priority}
          className={s.image}
        />
        {product.hoverImage && <Image src={product.hoverImage.url} alt="" fill sizes="25vw" className={s.hoverImage} />}
        {badge && (
          <Badge tone={badge.tone} className={s.badge}>
            {badge.label}
          </Badge>
        )}
      </div>

      <div className={s.body}>
        {product.rating.count > 0 && (
          <Rating value={product.rating.average} count={product.rating.count} size={12} compact />
        )}
        <h3 className={s.name}>
          <Link href={routes.product(product.slug)} className={s.nameLink}>
            {product.name}
          </Link>
        </h3>
        <p className={s.subtitle}>{product.subtitle}</p>
        {product.colors.length > 1 && <SwatchRow colors={product.colors} />}
        <div className={s.buy}>
          <Price amount={product.price} compareAt={product.compareAtPrice} className={s.price} />
          {product.quickAddSku && (
            <div className={s.quickAdd}>
              <QuickAddButton sku={product.quickAddSku} productName={product.name} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
