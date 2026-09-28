import "server-only";
import { Types } from "mongoose";
import { readDb } from "@/lib/db";
import { Review, type ReviewDoc } from "@/models";

export type ReviewDTO = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  variantLabel?: string;
  fit?: "small" | "true" | "large";
  photos: string[];
  verifiedBuyer: boolean;
  helpfulCount: number;
  createdAt: string;
};

export type ReviewSummaryDTO = {
  average: number;
  count: number;
  /** index 0 = 5 stars … index 4 = 1 star */
  breakdown: [number, number, number, number, number];
  recommendPct: number;
  photos: string[];
};

export type ReviewFilter = "all" | "photos" | "5" | "4" | "3" | "2" | "1";

function toDTO(r: Omit<ReviewDoc, "product">): ReviewDTO {
  return {
    id: String(r._id),
    authorName: r.authorName,
    rating: r.rating,
    body: r.body,
    variantLabel: r.variantLabel ?? undefined,
    fit: (r.fit ?? undefined) as ReviewDTO["fit"],
    photos: [...r.photos],
    verifiedBuyer: r.verifiedBuyer,
    helpfulCount: r.helpfulCount,
    createdAt: new Date(r.createdAt).toISOString(),
  };
}

export async function getReviews(productId: string, filter: ReviewFilter = "all", limit = 20): Promise<ReviewDTO[]> {
  await readDb();
  const q: Record<string, unknown> = { product: new Types.ObjectId(productId) };
  if (filter === "photos") q["photos.0"] = { $exists: true };
  else if (filter !== "all") q.rating = Number(filter);
  const docs = await Review.find(q).sort({ createdAt: -1 }).limit(limit).lean<ReviewDoc[]>();
  return docs.map(toDTO);
}

export async function getReviewSummary(productId: string): Promise<ReviewSummaryDTO> {
  await readDb();
  const product = new Types.ObjectId(productId);
  const [counts, photoDocs] = await Promise.all([
    Review.aggregate<{ _id: number; n: number }>([
      { $match: { product } },
      { $group: { _id: "$rating", n: { $sum: 1 } } },
    ]),
    Review.find({ product, "photos.0": { $exists: true } }, { photos: 1 })
      .limit(12)
      .lean<ReviewDoc[]>(),
  ]);

  const breakdown: ReviewSummaryDTO["breakdown"] = [0, 0, 0, 0, 0];
  let total = 0;
  let sum = 0;
  for (const { _id: stars, n } of counts) {
    breakdown[5 - stars] = n;
    total += n;
    sum += stars * n;
  }
  const positive = breakdown[0] + breakdown[1];

  return {
    average: total ? sum / total : 0,
    count: total,
    breakdown,
    recommendPct: total ? Math.round((positive / total) * 100) : 0,
    photos: photoDocs.flatMap((d) => d.photos).slice(0, 12),
  };
}

/** Store-wide rating for the Home social-proof strip. */
export async function getStoreRating(): Promise<{ average: number; count: number }> {
  await readDb();
  const [agg] = await Review.aggregate<{ average: number; count: number }>([
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  return { average: agg?.average ?? 0, count: agg?.count ?? 0 };
}

export type TestimonialDTO = ReviewDTO & { product: { name: string; slug: string } | null };

/** Home testimonials: the newest 5-star reviews from verified buyers, with the product they bought. */
export async function getHomeReviews(limit = 2): Promise<TestimonialDTO[]> {
  await readDb();
  const docs = await Review.find({ rating: 5, verifiedBuyer: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    // Unpublished products populate as null, so the quote renders without a dead link.
    .populate<{ product: { name: string; slug: string } | null }>({
      path: "product",
      select: "name slug",
      match: { isPublished: true },
    })
    .lean();
  return docs.map((d) => ({
    ...toDTO(d),
    product: d.product ? { name: d.product.name, slug: d.product.slug } : null,
  }));
}
