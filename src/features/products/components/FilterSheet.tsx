"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Icon, Sheet } from "@/components/ui";
import { listingHref, METAL_OPTIONS, PRICE_OPTIONS, SHOW_OPTIONS, SORT_OPTIONS, type ListingState } from "../listing";
import s from "./Filters.module.scss";

type Group = {
  key: keyof ListingState;
  legend: string;
  options: readonly { value: string; label: string }[];
  /** Label of the "no filter" choice; absent for sort (it always has a value). */
  any?: string;
};

const GROUPS: Group[] = [
  { key: "sort", legend: "Sort by", options: SORT_OPTIONS },
  { key: "metal", legend: "Metal", options: METAL_OPTIONS, any: "Any" },
  { key: "price", legend: "Price", options: PRICE_OPTIONS, any: "Any price" },
  { key: "show", legend: "Show only", options: SHOW_OPTIONS, any: "Everything" },
];

/**
 * "Filters" button + bottom sheet with every option as a big pill. Choices are a draft until
 * "Show results", so the grid doesn't reload on every tap.
 */
export function FilterSheet({
  basePath,
  state,
  activeCount,
  hideMetal = false,
}: {
  basePath: string;
  state: ListingState;
  activeCount: number;
  hideMetal?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ListingState>(state);
  const [pending, startTransition] = useTransition();

  function openSheet() {
    setDraft(state); // always start from what's applied
    setOpen(true);
  }

  function apply() {
    setOpen(false);
    startTransition(() => router.push(listingHref(basePath, draft), { scroll: false }));
  }

  return (
    <>
      <button
        type="button"
        className={s.filtersButton}
        onClick={openSheet}
        aria-haspopup="dialog"
        data-pending={pending || undefined}
      >
        <Icon name="sliders" size={20} />
        Filters
        {activeCount > 0 && (
          <span className={s.filtersCount}>
            {activeCount}
            <span className="visually-hidden"> applied</span>
          </span>
        )}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Filters">
        <div className={s.sheet}>
          {GROUPS.filter((g) => !(hideMetal && g.key === "metal")).map((g) => {
            const current = draft[g.key] ?? (g.key === "sort" ? "featured" : "");
            const options = g.any ? [{ value: "", label: g.any }, ...g.options] : g.options;
            return (
              <fieldset key={g.key} className={s.group}>
                <legend className={s.legend}>{g.legend}</legend>
                <div className={s.pills}>
                  {options.map((o) => (
                    <label key={o.value} className={s.pill}>
                      <input
                        type="radio"
                        name={g.key}
                        value={o.value}
                        checked={current === o.value}
                        onChange={() => setDraft((d) => ({ ...d, [g.key]: o.value || undefined }))}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}

          <div className={s.sheetActions}>
            <button type="button" className={s.clear} onClick={() => setDraft({ sort: draft.sort })}>
              Clear all
            </button>
            <Button onClick={apply} className={s.apply}>
              Show results
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
