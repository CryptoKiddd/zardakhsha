/**
 * Demo orders for the admin dashboard: `npm run seed:orders` (add), `npm run seed:orders -- --clear` (remove).
 * Spread over the last 90 days using the real products (their prices and costs), with realistic statuses and
 * a Bank of Georgia payment in the ledger for every paid order. Demo data is marked (order numbers ZK-9xxxxx,
 * emails @example.com), and --clear removes exactly that, nothing else.
 */
import mongoose from "mongoose";
import { Order } from "../src/models/Order";
import { Product, type ProductDoc } from "../src/models/Product";
import { Transaction } from "../src/models/Transaction";

const COUNT = 72;
const DEMO_EMAIL = /^demo\.\d+@example\.com$/;
const NAMES = [
  "Nino Beridze",
  "Ana Kapanadze",
  "Mariam Lomidze",
  "Tamar Gelashvili",
  "Giorgi Maisuradze",
  "Levan Tsiklauri",
  "Salome Janelidze",
  "Elene Chavchavadze",
];
const CITIES = ["Tbilisi", "Tbilisi", "Tbilisi", "Batumi", "Kutaisi", "Rustavi"];

// Small deterministic PRNG so every run makes the same shop history.
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T>(xs: T[]) => xs[Math.floor(rand() * xs.length)]!;

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (.env / .env.local)");
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const demo = await Order.find({ email: DEMO_EMAIL }, { number: 1 }).lean();
    await Transaction.deleteMany({ orderNumber: { $in: demo.map((o) => o.number) } });
    await Order.deleteMany({ email: DEMO_EMAIL });
    if (process.argv.includes("--clear")) {
      console.log(`Removed ${demo.length} demo orders.`);
      return;
    }

    const products = await Product.find({ isPublished: true }).lean<ProductDoc[]>();
    if (products.length === 0) throw new Error("No products. Run npm run seed first.");

    const now = Date.now();
    const orders = [];
    const payments = [];
    for (let i = 0; i < COUNT; i++) {
      // More orders recently: the shop is growing.
      const daysAgo = Math.floor(90 * rand() ** 1.6);
      const createdAt = new Date(now - daysAgo * 86_400_000 - Math.floor(rand() * 86_400_000));
      const lines = Array.from({ length: rand() < 0.3 ? 2 : 1 }, () => {
        const p = pick(products);
        const v = pick(p.variants);
        return {
          product: p._id,
          sku: v.sku,
          name: p.name,
          variantLabel: [v.enamelColor?.name, v.size ? `Size ${v.size}` : null].filter(Boolean).join(" · "),
          image: p.images[0]!.url,
          price: v.price,
          unitCost: v.cost ?? undefined,
          quantity: rand() < 0.15 ? 2 : 1,
        };
      });
      const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
      const shipping = subtotal >= 150_00 ? 0 : 8_00;
      // Old orders are delivered; recent ones are still moving; a few never paid.
      const status =
        rand() < 0.06
          ? "cancelled"
          : daysAgo > 6
            ? "delivered"
            : daysAgo > 2
              ? pick(["delivering", "delivered"])
              : pick(["pending_payment", "paid", "delivering"]);
      const number = `ZK-9${String(i).padStart(5, "0")}`;
      const name = pick(NAMES);
      orders.push({
        number,
        email: `demo.${i}@example.com`,
        lines,
        subtotal,
        shipping,
        discount: 0,
        total: subtotal + shipping,
        shippingAddress: { fullName: name, phone: "+995 555 00 00 00", city: pick(CITIES), street: "Rustaveli Ave 1" },
        status,
        statusHistory: [{ status: "pending_payment", at: createdAt }],
        createdAt,
        updatedAt: createdAt,
      });
      if (status !== "pending_payment" && status !== "cancelled") {
        payments.push({
          type: "payment",
          direction: "in",
          amount: subtotal + shipping,
          currency: "GEL",
          status: "completed",
          orderNumber: number,
          provider: "bog",
          providerRef: `demo-${number}`,
          description: `Payment for order ${number}`,
          occurredAt: new Date(createdAt.getTime() + 5 * 60_000),
          createdAt,
          updatedAt: createdAt,
        });
      }
    }
    // Native insert keeps our createdAt (Mongoose timestamps would stamp "now").
    await Order.collection.insertMany(orders);
    await Transaction.collection.insertMany(payments);
    const noCost = orders.flatMap((o) => o.lines).filter((l) => l.unitCost == null).length;
    console.log(`Added ${orders.length} demo orders and ${payments.length} payments.`);
    if (noCost) console.log(`${noCost} lines have no product cost; run npm run seed for demo costs on jewelry.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
