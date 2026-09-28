import "server-only";
import { cache } from "react";
import type { SortOrder } from "mongoose";
import { readDb } from "@/lib/db";
import { Product, type ProductDoc } from "@/models";
import { CATEGORIES, type CategorySlug } from "@/config/navigation";
import { toProductCard, toProductDetail } from "./mappers";
import type { ProductCardDTO, ProductDetailDTO, SortKey } from "./types";

const SORTS: Record<SortKey, Record<string, SortOrder>> = {
  featured: { featured: -1, "rating.count": -1 },
  newest: { createdAt: -1 },
  "price-asc": { "variants.price": 1 },
  "price-desc": { "variants.price": -1 },
  rating: { "rating.average": -1 },
};

/** Maps a /shop/[slug] segment to a Mongo filter. Categories, metals and collections share one URL space. */
function filterForSlug(slug: string): Record<string, unknown> | null {
  if (CATEGORIES.some((c) => c.slug === slug)) return { category: slug };
  if (slug === "new") return {};
  if (slug === "silver" || slug === "gold") return { "variants.metal": slug };
  if (slug === "gifts") return { collections: "gifts" };
  return null;
}

export type ListingParams = {
  slug: string;
  sort?: SortKey;
  metal?: "silver" | "gold";
  maxPrice?: number;
};

export async function getListing(params: ListingParams): Promise<{ products: ProductCardDTO[]; total: number } | null> {
  const base = filterForSlug(params.slug);
  if (!base) return null;

  await readDb();
  const filter: Record<string, unknown> = { ...base, isPublished: true };
  if (params.metal) filter["variants.metal"] = params.metal;
  if (params.maxPrice) filter["variants.price"] = { $lte: params.maxPrice };

  const sort = params.slug === "new" && !params.sort ? SORTS.newest : SORTS[params.sort ?? "featured"];
  const docs = await Product.find(filter).sort(sort).limit(60).lean<ProductDoc[]>();
  return { products: docs.map(toProductCard), total: docs.length };
}

export async function getFeatured(limit = 8): Promise<ProductCardDTO[]> {
  await readDb();
  const docs = await Product.find({ isPublished: true, badges: "bestseller" })
    .sort({ "rating.count": -1 })
    .limit(limit)
    .lean<ProductDoc[]>();
  return docs.map(toProductCard);
}

/** Home "Featured Works" bento: hand-picked pieces first, topped up by best-rated if fewer are flagged. */
export async function getFeaturedWorks(limit = 3): Promise<ProductCardDTO[]> {
  await readDb();
  const docs = await Product.find({ isPublished: true })
    .sort({ featured: -1, "rating.average": -1, "rating.count": -1 })
    .limit(limit)
    .lean<ProductDoc[]>();
  return docs.map(toProductCard);
}

/** `cache` de-duplicates the call between generateMetadata and the page in one request. */
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetailDTO | null> => {
  await readDb();
  const doc = await Product.findOne({ slug, isPublished: true }).lean<ProductDoc>();
  return doc ? toProductDetail(doc) : null;
});

export async function getRelated(product: ProductDetailDTO, limit = 8): Promise<ProductCardDTO[]> {
  await readDb();
  const docs = await Product.find({
    isPublished: true,
    category: product.category,
    slug: { $ne: product.slug },
  })
    .limit(limit)
    .lean<ProductDoc[]>();
  return docs.map(toProductCard);
}

/** "Complete the look": same collection, other categories. */
export async function getCompleteTheLook(product: ProductDetailDTO, limit = 3): Promise<ProductCardDTO[]> {
  await readDb();
  const self = await Product.findOne({ slug: product.slug }, { collections: 1 }).lean<ProductDoc>();
  const collections = (self?.collections ?? []).filter((c) => c !== "gifts");
  if (collections.length === 0) return [];
  const docs = await Product.find({
    isPublished: true,
    collections: { $in: collections },
    category: { $ne: product.category },
  })
    .limit(limit)
    .lean<ProductDoc[]>();
  return docs.map(toProductCard);
}

export async function searchProducts(
  q: string,
  { category, limit = 24 }: { category?: CategorySlug; limit?: number } = {},
): Promise<ProductCardDTO[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  await readDb();
  const filter: Record<string, unknown> = { isPublished: true, $text: { $search: term } };
  if (category) filter.category = category;
  const docs = await Product.find(filter, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean<ProductDoc[]>();
  return docs.map(toProductCard);
}

/** Published piece count per category, for the "Explore by Category" tiles. */
export async function getCategoryCounts(): Promise<Record<CategorySlug, number>> {
  await readDb();
  const rows = await Product.aggregate<{ _id: string; n: number }>([
    { $match: { isPublished: true } },
    { $group: { _id: "$category", n: { $sum: 1 } } },
  ]);
  return Object.fromEntries(CATEGORIES.map((c) => [c.slug, rows.find((r) => r._id === c.slug)?.n ?? 0])) as Record<
    CategorySlug,
    number
  >;
}

/** Bag "Pairs well with": best-rated published pieces the shopper doesn't already have in the bag. */
export async function getComplements(excludeProductIds: string[], limit = 6): Promise<ProductCardDTO[]> {
  await readDb();
  const docs = await Product.find({ isPublished: true, _id: { $nin: excludeProductIds } })
    .sort({ featured: -1, "rating.average": -1, "rating.count": -1 })
    .limit(limit)
    .lean<ProductDoc[]>();
  return docs.map(toProductCard);
}
