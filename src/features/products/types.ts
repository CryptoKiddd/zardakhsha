// DTOs: plain, serializable shapes passed from Server → Client Components.
// Never pass Mongoose documents to the client.

import type { ProductDoc } from "@/models/Product";

export type Metal = "silver" | "gold" | "none";

export type VariantDTO = {
  sku: string;
  metal: Metal;
  enamelColor: { name: string; hex: string };
  size?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  /** Decorations: physical size (mm) and weight instead of a ring size. */
  dimensions?: { widthMm?: number; heightMm?: number; depthMm?: number };
  weightGrams?: number;
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
  /** All buyable combinations, so a card's "+" can ask for metal/colour/size without another request. */
  variants: VariantDTO[];
  /** Set only when there is exactly one option to buy: then "+" adds it directly instead of asking. */
  quickAddSku?: string;
  soldOut: boolean;
};

export type ProductDetailDTO = ProductCardDTO & {
  description: string;
  images: { url: string; alt: string }[];
  materials: string;
  care: string;
};

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";
