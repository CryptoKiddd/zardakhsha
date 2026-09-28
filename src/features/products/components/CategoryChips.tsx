import Link from "next/link";
import { CATEGORIES, routes } from "@/config/navigation";
import s from "./CategoryChips.module.scss";

const EXTRA = [
  { slug: "silver", label: "Silver" },
  { slug: "gold", label: "Gold" },
] as const;

/** Round category shortcuts on Home (horizontal scroll). */
export function CategoryChips() {
  return (
    <ul className={s.row}>
      {[...CATEGORIES, ...EXTRA].map((c) => (
        <li key={c.slug}>
          <Link href={routes.shop(c.slug)} className={s.item}>
            <span className={s.circle} data-slug={c.slug} aria-hidden />
            {c.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
