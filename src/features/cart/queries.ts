import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { CART_COOKIE } from "@/config/shop";
import { readDb } from "@/lib/db";
import { Cart, Product, type CartDoc, type ProductDoc } from "@/models";
import { variantLabel } from "./variant-label";
import type { CartDTO, CartLineDTO } from "./types";

const EMPTY: CartDTO = { lines: [], count: 0, subtotal: 0 };

/** Current visitor's cart, resolved against live product data (price, stock). Cached per request. */
export const getCart = cache(async (): Promise<CartDTO> => {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return EMPTY;

  await readDb();
  const cart = await Cart.findOne({ cartId }).lean<CartDoc>();
  if (!cart || cart.items.length === 0) return EMPTY;

  const products = await Product.find({ _id: { $in: cart.items.map((i) => i.product) } }).lean<ProductDoc[]>();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines: CartLineDTO[] = [];
  for (const item of cart.items) {
    const p = byId.get(String(item.product));
    const v = p?.variants.find((x) => x.sku === item.sku);
    if (!p || !v) continue; // product removed since it was added

    lines.push({
      sku: v.sku,
      productId: String(p._id),
      slug: p.slug,
      name: p.name,
      variantLabel: variantLabel({
        metal: v.metal as "silver" | "gold",
        enamelColor: { name: v.enamelColor!.name, hex: v.enamelColor!.hex },
        size: v.size ?? undefined,
      }),
      image: { url: p.images[0]!.url, alt: p.images[0]!.alt },
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? undefined,
      quantity: Math.min(item.quantity, v.stock),
      stock: v.stock,
    });
  }

  return {
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
  };
});
