"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { routes } from "@/config/navigation";
import { CART_COOKIE, FREE_SHIPPING_THRESHOLD, LAST_ORDER_COOKIE, SHIPPING_FEE } from "@/config/shop";
import { addressSchema, fieldErrors, type AddressInput, type FieldErrors } from "@/features/account/schemas";
import { getCart } from "@/features/cart/queries";
import { getSession } from "@/lib/auth";
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

  const number = `ZK-${randomInt(100000, 999999)}`;
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
      quantity: l.quantity,
    })),
    subtotal: cart.subtotal,
    shipping,
    total: cart.subtotal + shipping,
    shippingAddress: address,
    status: "pending_payment",
    statusHistory: [{ status: "pending_payment", at: new Date() }],
  });

  // TODO(payments): create a payment session with the chosen provider (e.g. BOG / TBC)
  // here and redirect to it instead; the provider webhook then moves the order
  // pending_payment → paid (see config/order-status.ts, same guard as scripts/order-status.ts).

  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (cartId) await Cart.deleteOne({ cartId });
  const jar = await cookies();
  jar.delete(CART_COOKIE);
  // Lets this browser (guest or not) view its confirmation page; order numbers alone are guessable.
  jar.set(LAST_ORDER_COOKIE, number, { httpOnly: true, sameSite: "lax", path: "/order", maxAge: 60 * 60 * 24 });
  revalidatePath("/", "layout");

  redirect(routes.order(number));
}
