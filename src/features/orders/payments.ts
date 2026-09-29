import "server-only";
import { connectDb } from "@/lib/db";
import { getBogOrderStatus, isBogConfigured } from "@/lib/payments/bog";
import { Order, type OrderDoc } from "@/models";
import { transitionOrder } from "./transitions";

/**
 * Brings an unpaid order in line with the bank: paid → "paid", failed → "cancelled" (stock returned).
 * Safe to call any number of times, from the BOG callback and when the customer lands back on the order page.
 */
export async function syncPayment(number: string): Promise<void> {
  if (!isBogConfigured()) return;
  await connectDb();
  const order = await Order.findOne({ number }, { status: 1, payment: 1 }).lean<OrderDoc>();
  const bogOrderId = order?.payment?.providerOrderId;
  if (!order || order.status !== "pending_payment" || !bogOrderId) return;

  const { state, externalOrderId } = await getBogOrderStatus(bogOrderId);
  if (externalOrderId !== number) return; // never let one order's payment settle another
  if (state === "paid") await transitionOrder(number, "paid");
  else if (state === "failed") await transitionOrder(number, "cancelled");
}
