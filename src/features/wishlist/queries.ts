import "server-only";
import { cache } from "react";
import { toProductCard } from "@/features/products/mappers";
import type { ProductCardDTO } from "@/features/products/types";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { Customer, Product, type CustomerDoc, type ProductDoc } from "@/models";

/** Product ids the signed-in customer saved (empty for guests). `cache`: every card on a page shares one read. */
export const getWishlistIds = cache(async (): Promise<string[]> => {
  const session = await getSession();
  if (!session) return [];
  await readDb();
  const c = await Customer.findOne({ userId: session.user.id }, { wishlist: 1 }).lean<CustomerDoc>();
  return (c?.wishlist ?? []).map(String);
});

/** Saved pieces, newest first, skipping any that were unpublished since. */
export async function getWishlist(): Promise<ProductCardDTO[]> {
  const ids = await getWishlistIds();
  if (ids.length === 0) return [];
  await readDb();
  const docs = await Product.find({ _id: { $in: ids }, isPublished: true }).lean<ProductDoc[]>();
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  return [...ids]
    .reverse()
    .map((id) => byId.get(id))
    .filter((d): d is ProductDoc => !!d)
    .map(toProductCard);
}
