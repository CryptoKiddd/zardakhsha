import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { routes } from "@/config/navigation";
import { formatPrice } from "@/lib/format";
import type { ProductCardDTO } from "../types";
import s from "./DecorShowcase.module.scss";

/** Two large spotlight tiles (e.g. the vase and the plant pot). The carousel below is a normal ProductCarousel. */
export function DecorSpotlight({ products }: { products: ProductCardDTO[] }) {
  if (products.length === 0) return null;
  return (
    <ul className={s.spotlight}>
      {products.map((p) => (
        <li key={p.id}>
          <Link href={routes.product(p.slug)} className={s.tile}>
            <Image src={p.image.url} alt={p.image.alt} fill sizes="(min-width: 768px) 40vw, 50vw" className={s.image} />
            <span className={s.caption}>
              <span className={s.name}>{p.name}</span>
              <span className={s.meta}>
                {formatPrice(p.price)}
                <Icon name="arrowRight" size={16} />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
