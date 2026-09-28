import type { Route } from "next";
import { Chip } from "@/components/ui";
import type { SortKey } from "../types";
import { SortSelect } from "./SortSelect";
import s from "./ListingToolbar.module.scss";

export type ListingState = { sort?: SortKey; metal?: "silver" | "gold"; maxPrice?: number };

function hrefWith(base: string, state: ListingState, patch: Partial<ListingState>): Route {
  const next = { ...state, ...patch };
  const qs = new URLSearchParams();
  if (next.sort) qs.set("sort", next.sort);
  if (next.metal) qs.set("metal", next.metal);
  if (next.maxPrice) qs.set("max", String(next.maxPrice / 100));
  const q = qs.toString();
  return (q ? `${base}?${q}` : base) as Route;
}

/**
 * Filters are URL state (shareable, back-button friendly, server-rendered).
 * Chips are plain links; only the sort <select> needs client JS.
 */
export function ListingToolbar({ basePath, state }: { basePath: string; state: ListingState }) {
  const chips: { label: string; active: boolean; patch: Partial<ListingState> }[] = [
    {
      label: "Silver",
      active: state.metal === "silver",
      patch: { metal: state.metal === "silver" ? undefined : "silver" },
    },
    { label: "Gold", active: state.metal === "gold", patch: { metal: state.metal === "gold" ? undefined : "gold" } },
    {
      label: "Under ₾100",
      active: state.maxPrice === 100_00,
      patch: { maxPrice: state.maxPrice === 100_00 ? undefined : 100_00 },
    },
  ];

  return (
    <div className={s.toolbar}>
      <div className={s.chips}>
        {chips.map((c) => (
          <Chip key={c.label} href={hrefWith(basePath, state, c.patch)} selected={c.active}>
            {c.label}
          </Chip>
        ))}
      </div>
      <SortSelect value={state.sort ?? "featured"} />
    </div>
  );
}
