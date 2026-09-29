"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Customer, Product } from "@/models";

export type WishlistResult = { ok: true; saved: boolean } | { ok: false; needsAuth?: boolean; message: string };

const input = z.object({ productId: z.string().refine((v) => Types.ObjectId.isValid(v), "Invalid product") });

/** Save or unsave a piece. `$addToSet` / `$pull` are atomic, so double taps can't duplicate it. */
export async function setWishlisted(productId: string, saved: boolean): Promise<WishlistResult> {
  const parsed = input.safeParse({ productId });
  if (!parsed.success) return { ok: false, message: "Invalid product" };

  const session = await getSession();
  if (!session) return { ok: false, needsAuth: true, message: "Sign in to save pieces" };

  await connectDb();
  const id = new Types.ObjectId(parsed.data.productId);
  if (saved) {
    if (!(await Product.exists({ _id: id, isPublished: true }))) return { ok: false, message: "Piece not found" };
    await Customer.updateOne({ userId: session.user.id }, { $addToSet: { wishlist: id } }, { upsert: true });
  } else {
    await Customer.updateOne({ userId: session.user.id }, { $pull: { wishlist: id } });
  }

  revalidatePath("/account/wishlist");
  return { ok: true, saved };
}
