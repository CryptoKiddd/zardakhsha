import Link from "next/link";
import { ViewTransition } from "react";
import { CATEGORIES } from "@/config/navigation";
import { listingHref, type ListingState } from "../listing";
import s from "./CategoryTabs.module.scss";

const TABS = [{ slug: "new", label: "All" }, ...CATEGORIES];

/**
 * Switch category without losing filters (Silver + Rings → Silver + Earrings).
 * The underline is one named <ViewTransition>, so on navigation it glides from the old tab to the new one.
 */
export function CategoryTabs({ current, state }: { current: string; state: ListingState }) {
  return (
    <nav aria-label="Categories" className={s.nav}>
      <ul className={s.tabs}>
        {TABS.map((t) => {
          const active = t.slug === current;
          return (
            <li key={t.slug}>
              <Link
                href={listingHref(`/shop/${t.slug}`, state)}
                className={s.tab}
                aria-current={active ? "page" : undefined}
                scroll={false}
              >
                {t.label}
                {active && (
                  <ViewTransition name="category-indicator" share="indicator-glide" default="none">
                    <span className={s.indicator} aria-hidden />
                  </ViewTransition>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
