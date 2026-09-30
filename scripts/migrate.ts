/**
 * Safe, repeatable DB migration: `npm run db:migrate`.
 * Only ADDS what newer code expects: fills missing defaults on existing products and creates new indexes.
 * Never deletes data or drops indexes. Imports models directly (not "@/models") because that barrel is server-only.
 */
import mongoose from "mongoose";
import { Customer } from "../src/models/Customer";
import { Order } from "../src/models/Order";
import { Product } from "../src/models/Product";
import { StockMovement } from "../src/models/StockMovement";
import { Transaction } from "../src/models/Transaction";

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (.env / .env.local)");
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const audience = await Product.updateMany({ audience: { $exists: false } }, { $set: { audience: "unisex" } });
    const sourcing = await Product.updateMany(
      { "sourcing.type": { $exists: false } },
      { $set: { "sourcing.type": "in_house" } },
    );
    console.log(`products: audience set on ${audience.modifiedCount}, sourcing set on ${sourcing.modifiedCount}`);

    // createIndexes adds missing indexes only (unlike syncIndexes, it never drops any).
    for (const m of [Product, Order, Customer, StockMovement, Transaction]) {
      await m.createIndexes();
      console.log(`indexes ok: ${m.collection.collectionName}`);
    }
    const noCost = await Product.countDocuments({ "variants.cost": { $exists: false } });
    if (noCost) console.log(`note: ${noCost} product(s) have variants without a cost yet; set them in the admin.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
