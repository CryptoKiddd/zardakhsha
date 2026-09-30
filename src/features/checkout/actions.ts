"use server";

import type { Route } from "next";
import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { routes } from "@/config/navigation";
import { CART_COOKIE, FREE_SHIPPING_THRESHOLD, LAST_ORDER_COOKIE, SHIPPING_FEE } from "@/config/shop";
import { addressSchema, fieldErrors, type AddressInput, type FieldErrors } from "@/features/account/schemas";
import { getCart } from "@/features/cart/queries";
import { transitionOrder } from "@/features/orders/transitions";
import { getSession } from "@/lib/auth";
import { createBogOrder, isBogConfigured } from "@/lib/payments/bog";
import { siteUrl } from "@/lib/site";
import { connectDb } from "@/lib/db";
import { Cart, Order, Product } from "@/models";

export type CheckoutState = {
  message?: string;
  errors?: FieldErrors<AddressInput & { email: string }>;
  values?: Record<string, string>;
};

const checkoutSchema = addressSchema.extend({ email: z.string().trim().email("Enter a valid email") });

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };

  const cart = await getCart();
  if (cart.lines.length === 0) return { message: "Your bag is empty", values: raw };

  const session = await getSession().catch(() => null);
  const { email, ...address } = parsed.data;
  const shipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  await connectDb();

  // Reserve stock atomically per line; roll back if any line fails.
  const reserved: { sku: string; qty: number }[] = [];
  for (const line of cart.lines) {
    const res = await Product.updateOne(
      { variants: { $elemMatch: { sku: line.sku, stock: { $gte: line.quantity } } } },
      { $inc: { "variants.$.stock": -line.quantity } },
    );
    if (res.modifiedCount === 0) {
      for (const r of reserved) {
        await Product.updateOne({ "variants.sku": r.sku }, { $inc: { "variants.$.stock": r.qty } });
      }
      return { message: `Sorry, "${line.name}" just sold out. Please update your bag.`, values: raw };
    }
    reserved.push({ sku: line.sku, qty: line.quantity });
  }

  // Unit costs for profit reporting, read here on the server (never part of the bag sent to the browser).
  const costDocs = await Product.find(
    { "variants.sku": { $in: cart.lines.map((l) => l.sku) } },
    { "variants.sku": 1, "variants.cost": 1 },
  ).lean();
  const costBySku = new Map(costDocs.flatMap((p) => p.variants.map((v) => [v.sku, v.cost ?? undefined] as const)));

  const number = `ZK-${randomInt(100000, 999999)}`;
  const total = cart.subtotal + shipping;
  await Order.create({
    number,
    userId: session?.user.id,
    email,
    lines: cart.lines.map((l) => ({
      product: l.productId,
      sku: l.sku,
      name: l.name,
      variantLabel: l.variantLabel,
      image: l.image.url,
      price: l.price,
      unitCost: costBySku.get(l.sku),
      quantity: l.quantity,
    })),
    subtotal: cart.subtotal,
    shipping,
    total,
    shippingAddress: address,
    status: "pending_payment",
    statusHistory: [{ status: "pending_payment", at: new Date() }],
  });

  // Open the payment at Bank of Georgia. The callback / return trip settles it (features/orders/payments.ts).
  let paymentUrl: string | null = null;
  if (isBogConfigured()) {
    try {
      const base = siteUrl();
      const bog = await createBogOrder({
        externalOrderId: number,
        lines: cart.lines.map((l) => ({ sku: l.sku, name: l.name, unitPrice: l.price, quantity: l.quantity })),
        delivery: shipping,
        total,
        callbackUrl: `${base}/api/payments/bog`,
        successUrl: `${base}${routes.order(number)}`,
        failUrl: `${base}${routes.order(number)}?payment=failed`,
      });
      await Order.updateOne({ number }, { $set: { payment: { provider: "bog", providerOrderId: bog.id } } });
      paymentUrl = bog.redirectUrl;
    } catch (error) {
      console.error("BOG payment could not be started", error);
      await transitionOrder(number, "cancelled"); // returns the reserved stock; the bag is kept
      return {
        message: "We couldn't open the bank's payment page. Nothing was charged; please try again.",
        values: raw,
      };
    }
  } else if (process.env.NODE_ENV === "production") {
    await transitionOrder(number, "cancelled");
    return {
      message: "Online payment is unavailable right now. Nothing was charged; please try again later.",
      values: raw,
    };
  }
  // Development without BOG keys: the order stays "Awaiting payment" and goes straight to its page.

  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (cartId) await Cart.deleteOne({ cartId });
  const jar = await cookies();
  jar.delete(CART_COOKIE);
  // Lets this browser (guest or not) view its confirmation page; order numbers alone are guessable.
  jar.set(LAST_ORDER_COOKIE, number, { httpOnly: true, sameSite: "lax", path: "/order", maxAge: 60 * 60 * 24 });
  revalidatePath("/", "layout");

  // The bank's page is an external URL, outside the typed-route set.
  redirect(paymentUrl ? (paymentUrl as Route) : routes.order(number));
}
