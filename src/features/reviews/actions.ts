"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Order, Product, Review } from "@/models";

export type ReviewFormState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"rating" | "body", string>>;
};

const schema = z.object({
  productId: z.string().refine((v) => Types.ObjectId.isValid(v)),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Please choose a star rating").max(5),
  body: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(2000),
  fit: z
    .enum(["small", "true", "large"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function createReview(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Please sign in to write a review" };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: ReviewFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "rating" || key === "body") errors[key] ??= issue.message;
    }
    return { ok: false, errors };
  }
  const { productId, slug, rating, body, fit } = parsed.data;

  await connectDb();
  const verifiedBuyer = !!(await Order.exists({ userId: session.user.id, "lines.product": productId }));

  try {
    await Review.create({
      product: productId,
      userId: session.user.id,
      authorName: session.user.name.split(" ")[0] ?? "Customer",
      rating,
      body,
      fit,
      verifiedBuyer,
    });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return { ok: false, message: "You've already reviewed this piece" };
    throw e;
  }

  // Keep the denormalized rating on the product in sync (used by cards and sorting).
  const [agg] = await Review.aggregate<{ avg: number; n: number }>([
    { $match: { product: new Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } },
  ]);
  await Product.updateOne({ _id: productId }, { rating: { average: agg?.avg ?? 0, count: agg?.n ?? 0 } });

  revalidatePath(`/product/${slug}`);
  revalidatePath(`/product/${slug}/reviews`);
  return { ok: true, message: "Thank you! Your review is live." };
}
