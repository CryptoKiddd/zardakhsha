import "server-only";
import { allowedFrom, type OrderStatus } from "@/config/order-status";
import { connectDb } from "@/lib/db";
import { Order, Product, StockMovement, type OrderDoc } from "@/models";

/**
 * Moves an order to `to` only if that's a legal step from where it is now (config/order-status.ts).
 * The current status is checked inside the update, so concurrent callers (webhook + customer returning
 * from the bank) can't both apply it. Cancelling returns the items to stock. Returns true if it moved.
 */
export async function transitionOrder(number: string, to: OrderStatus): Promise<boolean> {
  await connectDb();
  const updated = await Order.findOneAndUpdate(
    { number, status: { $in: allowedFrom(to) } },
    { $set: { status: to }, $push: { statusHistory: { status: to, at: new Date() } } },
    { returnDocument: "after" },
  ).lean<OrderDoc>();
  if (!updated) return false;

  if (to === "cancelled") {
    for (const line of updated.lines) {
      await Product.updateOne({ "variants.sku": line.sku }, { $inc: { "variants.$.stock": line.quantity } });
    }
    await StockMovement.insertMany(
      updated.lines.map((l) => ({
        product: l.product,
        sku: l.sku,
        delta: l.quantity,
        reason: "order_cancelled",
        orderNumber: number,
      })),
    );
  }
  return true;
}
