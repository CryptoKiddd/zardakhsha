import Image from "next/image";
import Link from "next/link";
import { Badge, Price, Rating, SwatchRow, type BadgeTone } from "@/components/ui";
import { routes } from "@/config/navigation";
import { QuickAddButton } from "@/features/cart/components/QuickAddButton";
import type { ProductCardDTO } from "../types";
import s from "./ProductCard.module.scss";

const BADGE: Record<string, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "neutral" },
  bestseller: { label: "Bestseller", tone: "accent" },
  handmade: { label: "Handmade", tone: "gold" },
  limited: { label: "Limited", tone: "neutral" },
};

/**
 * THE product card: used in grids, carousels and "complete the look".
 * Server Component; only the quick-add button is interactive.
 */
export function ProductCard({ product, priority = false }: { product: ProductCardDTO; priority?: boolean }) {
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const badge = onSale
    ? { label: `-${Math.round((1 - product.price / product.compareAtPrice!) * 100)}%`, tone: "sale" as const }
    : product.badges.map((b) => BADGE[b]).find(Boolean);

  return (
    <article className={s.card}>
      <div className={s.media}>
        <Image
          src={product.image.url}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          priority={priority}
          className={s.image}
        />
        {product.hoverImage && <Image src={product.hoverImage.url} alt="" fill sizes="25vw" className={s.hoverImage} />}
        {badge && (
          <Badge tone={badge.tone} className={s.badge}>
            {badge.label}
          </Badge>
        )}
        {product.quickAddSku && (
          <div className={s.quickAdd}>
            <QuickAddButton sku={product.quickAddSku} productName={product.name} />
          </div>
        )}
      </div>

      <div className={s.body}>
        <h3 className={s.name}>
          <Link href={routes.product(product.slug)} className={s.nameLink}>
            {product.name}
          </Link>
        </h3>
        <Price amount={product.price} compareAt={product.compareAtPrice} size="sm" />
        <div className={s.meta}>
          {product.colors.length > 1 && <SwatchRow colors={product.colors} />}
          {product.rating.count > 0 && <Rating value={product.rating.average} count={product.rating.count} size={12} />}
        </div>
      </div>
    </article>
  );
}
