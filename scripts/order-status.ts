/**
 * Move an order along its lifecycle until the admin panel exists:
 *
 *   npm run order:status -- ZK-123456            show the order's status and the allowed next steps
 *   npm run order:status -- ZK-123456 delivering  apply a transition
 *
 * Only transitions allowed by config/order-status.ts are applied, atomically (the status is checked
 * inside the update), so two people can't push the same order into conflicting states.
 * Cancelling puts the items back in stock.
 * Imports models directly (not "@/models") because that barrel is server-only.
 */
import mongoose from "mongoose";
import { allowedFrom, isOrderStatus, STATUS_LABEL, TRANSITIONS, type OrderStatus } from "../src/config/order-status";
import { Order } from "../src/models/Order";
import { Product } from "../src/models/Product";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main() {
  const [number, to] = process.argv.slice(2);
  if (!number) fail("Usage: npm run order:status -- <ORDER-NUMBER> [status]");
  if (!process.env.MONGODB_URI) fail("MONGODB_URI is not set (.env / .env.local)");

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const order = await Order.findOne({ number }).lean();
    if (!order) fail(`No order ${number}`);
    const from = order.status as OrderStatus;

    if (!to) {
      const next = TRANSITIONS[from];
      console.log(`${number}: ${STATUS_LABEL[from]} (${from})`);
      console.log(next.length ? `Next: ${next.join(" | ")}` : "Final state: no further changes.");
      return;
    }

    if (!isOrderStatus(to)) fail(`Unknown status "${to}". One of: ${Object.keys(TRANSITIONS).join(", ")}`);
    if (!TRANSITIONS[from].includes(to)) {
      fail(`Can't go ${from} → ${to}. Allowed from ${from}: ${TRANSITIONS[from].join(", ") || "none"}`);
    }

    const updated = await Order.findOneAndUpdate(
      { number, status: { $in: allowedFrom(to) } },
      { $set: { status: to }, $push: { statusHistory: { status: to, at: new Date() } } },
      { returnDocument: "after" },
    ).lean();
    if (!updated) fail(`${number} changed while updating; run again to see its current status.`);

    if (to === "cancelled") {
      for (const line of order.lines) {
        await Product.updateOne({ "variants.sku": line.sku }, { $inc: { "variants.$.stock": line.quantity } });
      }
    }

    console.log(`${number}: ${STATUS_LABEL[from]} → ${STATUS_LABEL[to]}`);
  } finally {
    await mongoose.disconnect();
  }
}

main();
