import Image from "next/image";
import Link from "next/link";
import { Badge, Price, Rating, SwatchRow } from "@/components/ui";
import { routes } from "@/config/navigation";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { getWishlistIds } from "@/features/wishlist/queries";
import { cardBadge } from "../badges";
import type { ProductCardDTO } from "../types";
import { QuickAdd } from "./QuickAdd";
import s from "./ProductCard.module.scss";

/**
 * THE product card (Stitch): photo inset in the card, badge top-left, heart top-right, and the same "+"
 * bottom-right on every card. Server Component; only the heart and "+" are client islands.
 */
export async function ProductCard({ product, priority = false }: { product: ProductCardDTO; priority?: boolean }) {
  const badge = cardBadge(product);
  const saved = (await getWishlistIds()).includes(product.id); // one read per request, shared by all cards

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
        <div className={s.wish}>
          <WishlistButton productId={product.id} productName={product.name} initialSaved={saved} />
        </div>
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
          <QuickAdd product={product} />
        </div>
      </div>
    </article>
  );
}
