"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CART_COOKIE } from "@/config/shop";
import { getOrderForViewer } from "@/features/orders/queries";
import { getSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Cart, Product } from "@/models";
import type { ActionResult } from "./types";

const MAX_QTY = 10;

async function getOrCreateCartId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  jar.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return id;
}

function refreshCartUi() {
  // Header bag count lives in every layout, so revalidate from the root.
  revalidatePath("/", "layout");
}

const addSchema = z.object({
  sku: z.string().min(1, "Please choose an option"),
  quantity: z.coerce.number().int().min(1).max(MAX_QTY).default(1),
});

/** Form action for useActionState: `(prevState, formData) => state`. */
export async function addToCart(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = addSchema.safeParse({ sku: formData.get("sku"), quantity: formData.get("quantity") ?? 1 });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]!.message };
  const { sku, quantity } = parsed.data;

  await connectDb();
  const product = await Product.findOne({ "variants.sku": sku, isPublished: true }, { variants: 1 }).lean();
  const variant = product?.variants.find((v) => v.sku === sku);
  if (!product || !variant) return { ok: false, message: "This item is no longer available" };
  if (variant.stock < 1) return { ok: false, message: "Sorry, this option is sold out" };

  const cartId = await getOrCreateCartId();
  const session = await getSession().catch(() => null);
  const cart = (await Cart.findOne({ cartId })) ?? new Cart({ cartId, items: [] });
  if (session?.user.id) cart.userId = session.user.id;

  const line = cart.items.find((i) => i.sku === sku);
  const nextQty = Math.min((line?.quantity ?? 0) + quantity, variant.stock, MAX_QTY);
  if (line) line.quantity = nextQty;
  else cart.items.push({ product: product._id, sku, quantity: nextQty });

  await cart.save();
  refreshCartUi();
  return { ok: true, message: "Added to your bag" };
}

const qtySchema = z.object({ sku: z.string().min(1), quantity: z.number().int().min(0).max(MAX_QTY) });

/** quantity 0 removes the line. Called from CartLines with useOptimistic. */
export async function setLineQuantity(sku: string, quantity: number): Promise<ActionResult> {
  const parsed = qtySchema.safeParse({ sku, quantity });
  if (!parsed.success) return { ok: false, message: "Invalid quantity" };

  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return { ok: false, message: "Your bag is empty" };

  await connectDb();
  if (parsed.data.quantity === 0) {
    await Cart.updateOne({ cartId }, { $pull: { items: { sku } } });
  } else {
    await Cart.updateOne({ cartId, "items.sku": sku }, { $set: { "items.$.quantity": parsed.data.quantity } });
  }
  refreshCartUi();
  return { ok: true };
}

/**
 * "Return to checkout" after a failed or abandoned bank payment: puts the order's pieces back in the bag
 * (as far as they're still in stock) and goes to checkout. Only the order's owner can do this.
 */
export async function restoreOrderToBag(number: string): Promise<void> {
  const parsed = z.string().max(20).safeParse(number);
  const order = parsed.success ? await getOrderForViewer(parsed.data) : null;
  if (!order) redirect("/bag");

  await connectDb();
  const cartId = await getOrCreateCartId();
  const cart = (await Cart.findOne({ cartId })) ?? new Cart({ cartId, items: [] });
  for (const line of order.lines) {
    const product = await Product.findOne({ "variants.sku": line.sku, isPublished: true }, { variants: 1 }).lean();
    const stock = product?.variants.find((v) => v.sku === line.sku)?.stock ?? 0;
    if (!product || stock < 1 || cart.items.some((i) => i.sku === line.sku)) continue;
    cart.items.push({ product: product._id, sku: line.sku, quantity: Math.min(line.quantity, stock, MAX_QTY) });
  }
  await cart.save();
  refreshCartUi();
  redirect("/checkout");
}
