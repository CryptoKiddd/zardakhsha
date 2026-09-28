import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

export const ORDER_STATUSES = ["pending_payment", "paid", "shipped", "delivered", "cancelled"] as const;

/** Snapshot of the line at purchase time: later product edits never change past orders. */
const orderLineSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    variantLabel: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    number: { type: String, required: true, unique: true }, // "ZK-10234"
    userId: { type: String, index: true },
    email: { type: String, required: true },
    lines: { type: [orderLineSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      apartment: String,
      postalCode: String,
      notes: String,
    },
    status: { type: String, enum: ORDER_STATUSES, default: "pending_payment", index: true },
  },
  { timestamps: true },
);

export type OrderDoc = InferSchemaType<typeof orderSchema> & { _id: Types.ObjectId; createdAt: Date };

export const Order: Model<OrderDoc> = (models.Order as Model<OrderDoc>) ?? model<OrderDoc>("Order", orderSchema);
