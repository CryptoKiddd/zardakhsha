import type { Route } from "next";

/**
 * NAVIGATION CONTRACT: the one place that decides how users move around.
 * Header variant per screen is set by the route-group layouts:
 *   app/(main)/layout.tsx      → Header A (burger + search | logo | account + bag): /, /shop/*, /account
 *   app/(inner)/layout.tsx     → Header B (back | logo | bag): inner pages incl. /search
 *   app/(checkout)/…/layout.tsx→ Header C (back | logo | secure)
 * There is NO bottom tab bar anywhere. Don't add headers inside pages.
 */

export type NavLink = { label: string; href: Route };

/** Typed URL builders for dynamic routes. Use these instead of template strings in JSX. */
export const routes = {
  shop: (slug: string) => `/shop/${slug}` as Route,
  product: (slug: string) => `/product/${slug}` as Route,
  reviews: (slug: string, filter?: string) =>
    (filter ? `/product/${slug}/reviews?filter=${filter}` : `/product/${slug}/reviews`) as Route,
  order: (number: string) => `/order/${encodeURIComponent(number)}` as Route,
  search: (q: string, category?: string) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    const query = qs.toString();
    return (query ? `/search?${query}` : "/search") as Route;
  },
};

export const CATEGORIES = [
  { slug: "rings", label: "Rings" },
  { slug: "earrings", label: "Earrings" },
  { slug: "bracelets", label: "Bracelets" },
  { slug: "pendants", label: "Pendants" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const MENU_PRIMARY: NavLink[] = [
  { label: "New In", href: routes.shop("new") },
  ...CATEGORIES.map((c) => ({ label: c.label, href: routes.shop(c.slug) })),
  { label: "Silver Collection", href: routes.shop("silver") },
  { label: "Gold Collection", href: routes.shop("gold") },
];

export const MENU_SECONDARY: NavLink[] = [
  { label: "Gift Guide", href: routes.shop("gifts") },
  { label: "About the Atelier", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const MENU_ACCOUNT: NavLink[] = [
  { label: "My Account", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
];

/**
 * Where the back arrow goes when there is no in-app history
 * (user landed directly from Google/Instagram). Mirrors the screen map in CLAUDE.md.
 */
export function backFallback(pathname: string): Route {
  const reviews = pathname.match(/^\/product\/([^/]+)\/reviews/);
  if (reviews) return routes.product(reviews[1]!);
  if (pathname.startsWith("/product/")) return routes.shop("new");
  if (pathname.startsWith("/account/")) return "/account";
  if (pathname.startsWith("/checkout")) return "/bag";
  return "/";
}
