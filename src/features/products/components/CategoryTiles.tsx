import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, routes, type CategorySlug } from "@/config/navigation";
import s from "./CategoryTiles.module.scss";

/** Photo tiles linking to each category listing. `counts` is null while streaming (same geometry, no numbers). */
export function CategoryTiles({ counts }: { counts: Record<CategorySlug, number> | null }) {
  return (
    <ul className={s.grid}>
      {CATEGORIES.map((c) => (
        <li key={c.slug}>
          <Link href={routes.shop(c.slug)} className={s.tile}>
            <Image src={`/images/home/${c.slug}.jpg`} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" />
            <span className={s.caption}>
              <span className={s.name}>{c.label}</span>
              <span className={s.count}>{counts ? `${counts[c.slug]} pieces` : " "}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
