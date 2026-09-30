import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

/** in: payment. out: refund, supplier_purchase (stock bought), delivery_cost, expense. */
export const TRANSACTION_TYPES = ["payment", "refund", "supplier_purchase", "delivery_cost", "expense"] as const;
export const TRANSACTION_STATUSES = ["pending", "completed", "failed"] as const;

/**
 * Money ledger: every amount that comes in or goes out, for the admin Transactions screen and profit
 * reports. Amounts are positive tetri; `direction` says which way. Entries from the bank carry its reference,
 * and the unique index below makes recording them idempotent (callback + return trip can both run).
 */
const transactionSchema = new Schema(
  {
    type: { type: String, enum: TRANSACTION_TYPES, required: true, index: true },
    direction: { type: String, enum: ["in", "out"], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "GEL" },
    status: { type: String, enum: TRANSACTION_STATUSES, default: "completed", index: true },
    orderNumber: { type: String, index: true },
    provider: { type: String, enum: ["bog", "manual"], default: "manual" },
    providerRef: { type: String }, // bank's order / refund id
    description: { type: String, trim: true, maxlength: 500 },
    occurredAt: { type: Date, default: () => new Date(), index: true },
    userId: { type: String }, // admin who recorded a manual entry
  },
  { timestamps: true },
);

transactionSchema.index(
  { provider: 1, providerRef: 1, type: 1 },
  { unique: true, partialFilterExpression: { providerRef: { $type: "string" } } },
);

export type TransactionDoc = InferSchemaType<typeof transactionSchema> & { _id: Types.ObjectId };

export const Transaction: Model<TransactionDoc> =
  (models.Transaction as Model<TransactionDoc>) ?? model<TransactionDoc>("Transaction", transactionSchema);
