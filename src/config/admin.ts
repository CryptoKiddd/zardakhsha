import type { Route } from "next";
import type { IconName } from "@/components/ui";

/** Admin sidebar. Items without an href aren't built yet and render as "Soon" (never a dead link). */
export type AdminNavItem = { label: string; icon: IconName; href?: Route };

export const ADMIN_NAV: { heading: string; items: AdminNavItem[] }[] = [
  { heading: "Overview", items: [{ label: "Dashboard", icon: "home", href: "/admin" }] },
  {
    heading: "Sales",
    items: [
      { label: "Orders", icon: "bag" },
      { label: "Transactions", icon: "returns" },
      { label: "Customers", icon: "user" },
    ],
  },
  {
    heading: "Catalog",
    items: [
      { label: "Products", icon: "sparkle" },
      { label: "Categories", icon: "sliders" },
      { label: "Stock", icon: "truck" },
    ],
  },
  {
    heading: "Storefront",
    items: [
      { label: "Homepage & featured", icon: "star" },
      { label: "Promotions", icon: "heart" },
      { label: "Reviews", icon: "mail" },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Settings", icon: "lock" },
      { label: "Team & roles", icon: "shield" },
    ],
  },
];
