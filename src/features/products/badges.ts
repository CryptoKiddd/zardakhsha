import type { BadgeTone } from "@/components/ui";
import type { ProductCardDTO } from "./types";

const BADGE: Record<string, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "neutral" },
  bestseller: { label: "Bestseller", tone: "accent" },
  handmade: { label: "Handmade", tone: "gold" },
  limited: { label: "Limited", tone: "neutral" },
};

/** The one badge a card shows: a sale discount wins, otherwise the first known merchandising badge. */
export function cardBadge(product: ProductCardDTO): { label: string; tone: BadgeTone } | undefined {
  const { price, compareAtPrice } = product;
  if (compareAtPrice != null && compareAtPrice > price) {
    return { label: `-${Math.round((1 - price / compareAtPrice) * 100)}%`, tone: "sale" };
  }
  return product.badges.map((b) => BADGE[b]).find(Boolean);
}
