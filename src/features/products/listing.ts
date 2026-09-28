// Listing filter state. The URL is the state (shareable, back-button friendly), so everything here is plain
// data + pure functions, usable by Server Components (parsing, queries) and client islands (the filter sheet).
import type { Route } from "next";
import type { SortKey } from "./types";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export const METAL_OPTIONS = [
  { value: "silver", label: "925 Silver" },
  { value: "gold", label: "Gold" },
] as const;

/** Price buckets in tetri. Buckets instead of a slider: one tap, and they fit the catalog's real spread. */
export const PRICE_OPTIONS = [
  { value: "under-100", label: "Under ₾100", min: undefined, max: 100_00 },
  { value: "100-200", label: "₾100–200", min: 100_00, max: 200_00 },
  { value: "over-200", label: "Over ₾200", min: 200_00, max: undefined },
] as const;

export const SHOW_OPTIONS = [
  { value: "sale", label: "On sale" },
  { value: "bestseller", label: "Bestsellers" },
  { value: "new", label: "New" },
  { value: "handmade", label: "Handmade" },
] as const;

export type Metal = (typeof METAL_OPTIONS)[number]["value"];
export type PriceRange = (typeof PRICE_OPTIONS)[number]["value"];
export type ShowOnly = (typeof SHOW_OPTIONS)[number]["value"];

export type ListingState = { sort?: SortKey; metal?: Metal; price?: PriceRange; show?: ShowOnly };
export type FilterKey = "metal" | "price" | "show";

type Params = Record<string, string | string[] | undefined>;

function pick<T extends string>(value: unknown, allowed: readonly { value: T }[]): T | undefined {
  return allowed.find((o) => o.value === value)?.value;
}

/** Unknown or malformed values are dropped, never trusted. */
export function parseListingState(sp: Params): ListingState {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]);
  return {
    sort: pick(one("sort"), SORT_OPTIONS),
    metal: pick(one("metal"), METAL_OPTIONS),
    price: pick(one("price"), PRICE_OPTIONS),
    show: pick(one("show"), SHOW_OPTIONS),
  };
}

/** `/shop/rings?metal=silver`: empty values and the default sort are left out of the URL. */
export function listingHref(basePath: string, state: ListingState, patch: Partial<ListingState> = {}): Route {
  const next = { ...state, ...patch };
  const qs = new URLSearchParams();
  if (next.sort && next.sort !== "featured") qs.set("sort", next.sort);
  if (next.metal) qs.set("metal", next.metal);
  if (next.price) qs.set("price", next.price);
  if (next.show) qs.set("show", next.show);
  const query = qs.toString();
  return (query ? `${basePath}?${query}` : basePath) as Route;
}

/** Applied filters as removable chips, in URL order. Sort is not a filter, so it's not listed. */
export function activeFilters(state: ListingState): { key: FilterKey; label: string }[] {
  const out: { key: FilterKey; label: string }[] = [];
  if (state.metal) out.push({ key: "metal", label: METAL_OPTIONS.find((o) => o.value === state.metal)!.label });
  if (state.price) out.push({ key: "price", label: PRICE_OPTIONS.find((o) => o.value === state.price)!.label });
  if (state.show) out.push({ key: "show", label: SHOW_OPTIONS.find((o) => o.value === state.show)!.label });
  return out;
}

/** One-tap suggestions shown next to the Filters button (the full set lives in the sheet). */
export const QUICK_FILTERS: { key: FilterKey; value: string; label: string }[] = [
  { key: "metal", value: "silver", label: "Silver" },
  { key: "metal", value: "gold", label: "Gold" },
  { key: "price", value: "under-100", label: "Under ₾100" },
  { key: "show", value: "sale", label: "On sale" },
  { key: "show", value: "bestseller", label: "Bestsellers" },
];

export function priceBounds(price?: PriceRange): { min?: number; max?: number } {
  const o = PRICE_OPTIONS.find((p) => p.value === price);
  return o ? { min: o.min, max: o.max } : {};
}
