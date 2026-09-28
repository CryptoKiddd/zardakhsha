import Link from "next/link";
import { Icon } from "@/components/ui";
import { activeFilters, listingHref, QUICK_FILTERS, type ListingState } from "../listing";
import { FilterSheet } from "./FilterSheet";
import s from "./Filters.module.scss";

/**
 * Sticky row under the header: [Filters •n] + one-tap chips.
 * Applied filters come first as filled chips with ✕; suggestions follow as outlines. So the same row
 * shows what's on, removes it in one tap, and offers the most-used filters without opening anything.
 */
export function FilterBar({ basePath, state }: { basePath: string; state: ListingState }) {
  const applied = activeFilters(state);
  const suggestions = QUICK_FILTERS.filter((q) => state[q.key] !== q.value);

  return (
    <div className={s.bar}>
      <FilterSheet basePath={basePath} state={state} activeCount={applied.length} />
      <ul className={s.chips} aria-label="Quick filters">
        {applied.map((f) => (
          <li key={f.key}>
            <Link
              href={listingHref(basePath, state, { [f.key]: undefined })}
              className={s.chipOn}
              scroll={false}
              aria-label={`Remove filter: ${f.label}`}
            >
              {f.label}
              <Icon name="close" size={16} />
            </Link>
          </li>
        ))}
        {suggestions.map((q) => (
          <li key={`${q.key}-${q.value}`}>
            <Link href={listingHref(basePath, state, { [q.key]: q.value })} className={s.chip} scroll={false}>
              {q.label}
            </Link>
          </li>
        ))}
        {applied.length > 1 && (
          <li>
            <Link href={listingHref(basePath, { sort: state.sort })} className={s.clearChip} scroll={false}>
              Clear all
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
