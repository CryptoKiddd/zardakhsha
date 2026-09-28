// DTOs: plain, serializable shapes passed from Server → Client Components.
// Never pass Mongoose documents to the client.

import type { ProductDoc } from "@/models/Product";

export type Metal = "silver" | "gold";

export type VariantDTO = {
  sku: string;
  metal: Metal;
  enamelColor: { name: string; hex: string };
  size?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
};

export type ProductCardDTO = {
  id: string;
  slug: string;
  name: string;
  category: ProductDoc["category"];
  /** Short material line under the name, e.g. "Cobalt enamel · 925 silver". */
  subtitle: string;
  image: { url: string; alt: string };
  hoverImage?: { url: string; alt: string };
  price: number;
  compareAtPrice?: number;
  colors: { name: string; hex: string }[];
  badges: string[];
  rating: { average: number; count: number };
  /** SKU used by the card's quick-add button (first in-stock variant). */
  quickAddSku?: string;
};

export type ProductDetailDTO = ProductCardDTO & {
  description: string;
  images: { url: string; alt: string }[];
  variants: VariantDTO[];
  materials: string;
  care: string;
};

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";
