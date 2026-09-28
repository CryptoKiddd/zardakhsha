import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";
// Relative import so scripts (tsx) can load models without path aliases.
import { ORDER_STATUSES } from "../config/order-status";

export { ORDER_STATUSES };

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
    /** Every status the order has been in, oldest first: drives the customer's timeline. */
    statusHistory: {
      type: [
        {
          _id: false,
          status: { type: String, enum: ORDER_STATUSES, required: true },
          at: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export type OrderDoc = InferSchemaType<typeof orderSchema> & { _id: Types.ObjectId; createdAt: Date };

export const Order: Model<OrderDoc> = (models.Order as Model<OrderDoc>) ?? model<OrderDoc>("Order", orderSchema);
