import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/navigation";
import s from "./CategoryChips.module.scss";

type Chip = { slug: string; label: string } & ({ image: string } | { glyph: string });

// Order and treatment from the Stitch "Atelier Archives" row: photo tiles for categories, typographic tiles for metals.
const CHIPS: Chip[] = [
  { slug: "rings", label: "Rings", image: "/images/home/rings.jpg" },
  { slug: "bracelets", label: "Bracelets", image: "/images/home/bracelets.jpg" },
  { slug: "pendants", label: "Pendants", image: "/images/home/pendants.jpg" },
  { slug: "earrings", label: "Earrings", image: "/images/home/earrings.jpg" },
  { slug: "decorations", label: "Decor", image: "/images/home/decorations.jpg" },
  { slug: "silver", label: "Silver", glyph: "925" },
  { slug: "gold", label: "Gold", glyph: "24K" },
];

/** Category shortcuts on Home (horizontal scroll). */
export function CategoryChips() {
  return (
    <nav aria-labelledby="category-chips-title" className={s.wrap}>
      <div className={s.head}>
        <h2 id="category-chips-title" className={s.eyebrow}>
          Atelier Archives
        </h2>
        <span className={s.hint} aria-hidden>
          Swipe to explore
        </span>
      </div>
      <ul className={s.row}>
        {CHIPS.map((c) => (
          <li key={c.slug}>
            <Link href={routes.shop(c.slug)} className={s.item}>
              <span className={s.tile} data-slug={c.slug} aria-hidden>
                {"image" in c ? <Image src={c.image} alt="" fill sizes="64px" /> : c.glyph}
              </span>
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
