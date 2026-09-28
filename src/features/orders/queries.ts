import "server-only";
import { cookies } from "next/headers";
import { LAST_ORDER_COOKIE } from "@/config/shop";
import { isOrderStatus, type OrderStatus } from "@/config/order-status";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { Order, type OrderDoc } from "@/models";

export type OrderDetailDTO = {
  number: string;
  email: string;
  status: OrderStatus;
  /** First time the order reached each status (ISO), for timeline timestamps. */
  reachedAt: Partial<Record<OrderStatus, string>>;
  lines: { sku: string; name: string; variantLabel: string; image: string; price: number; quantity: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  address: { fullName: string; phone: string; city: string; street: string; apartment?: string };
  isGuest: boolean;
  createdAt: string;
};

/**
 * The order, only if the viewer owns it: the same signed-in user, or the browser that placed it
 * (order numbers alone are guessable, so the number is never enough). Otherwise null.
 */
export async function getOrderForViewer(number: string): Promise<OrderDetailDTO | null> {
  await readDb();
  const [order, session, jar] = await Promise.all([
    Order.findOne({ number }).lean<OrderDoc>(),
    getSession(),
    cookies(),
  ]);
  if (!order) return null;
  const isOwner = (!!order.userId && order.userId === session?.user.id) || jar.get(LAST_ORDER_COOKIE)?.value === number;
  if (!isOwner) return null;

  const reachedAt: OrderDetailDTO["reachedAt"] = {};
  for (const h of order.statusHistory ?? []) {
    if (isOrderStatus(h.status)) reachedAt[h.status] ??= new Date(h.at).toISOString();
  }
  // Orders placed before statusHistory existed: creation is when they were placed.
  reachedAt.pending_payment ??= new Date(order.createdAt).toISOString();

  const a = order.shippingAddress!; // required by the schema
  return {
    number: order.number,
    email: order.email,
    status: isOrderStatus(order.status) ? order.status : "pending_payment",
    reachedAt,
    lines: order.lines.map((l) => ({
      sku: l.sku,
      name: l.name,
      variantLabel: l.variantLabel,
      image: l.image,
      price: l.price,
      quantity: l.quantity,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    address: {
      fullName: a.fullName,
      phone: a.phone,
      city: a.city,
      street: a.street,
      apartment: a.apartment ?? undefined,
    },
    isGuest: !order.userId,
    createdAt: new Date(order.createdAt).toISOString(),
  };
}
