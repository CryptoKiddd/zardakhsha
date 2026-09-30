import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

/** Why stock changed. Positive deltas: made, purchased, returned, order_cancelled. Negative: sale, damaged. */
export const STOCK_REASONS = [
  "sale",
  "order_cancelled",
  "made",
  "purchased",
  "returned",
  "damaged",
  "correction",
] as const;

/**
 * Append-only log of every stock change, per SKU. The variant's `stock` is the current number; this is the
 * history behind it (admin "movement history" drawer, stock reports).
 */
const stockMovementSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    delta: { type: Number, required: true }, // units, + in / − out
    reason: { type: String, enum: STOCK_REASONS, required: true },
    orderNumber: { type: String },
    note: { type: String, trim: true, maxlength: 500 },
    userId: { type: String }, // admin who made a manual adjustment
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

stockMovementSchema.index({ sku: 1, createdAt: -1 });
stockMovementSchema.index({ orderNumber: 1 });

export type StockMovementDoc = InferSchemaType<typeof stockMovementSchema> & { _id: Types.ObjectId; createdAt: Date };

export const StockMovement: Model<StockMovementDoc> =
  (models.StockMovement as Model<StockMovementDoc>) ?? model<StockMovementDoc>("StockMovement", stockMovementSchema);
