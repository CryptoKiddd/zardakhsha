import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import s from "./BentoGrid.module.scss";

export type BentoTile = {
  title: string;
  subtitle?: string;
  href: Route;
  image: { url: string; alt: string };
};

/** 1 large (2x2) + 2 small stacked tiles. Pass exactly 3 tiles; the first is the hero tile. */
export function BentoGrid({ tiles }: { tiles: [BentoTile, BentoTile, BentoTile] }) {
  return (
    <div className={s.grid}>
      {tiles.map((t, i) => (
        <Link key={t.href} href={t.href} className={i === 0 ? s.large : s.small}>
          <Image
            src={t.image.url}
            alt={t.image.alt}
            fill
            sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
            className={s.image}
          />
          <span className={s.caption}>
            <span className={s.title}>{t.title}</span>
            {t.subtitle && <span className={s.subtitle}>{t.subtitle}</span>}
            <span className={s.cta}>Shop</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
