import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: 10 },
  },
  { _id: false },
);

/** Guest-friendly cart keyed by an httpOnly cookie. Linked to a user after sign-in. */
const cartSchema = new Schema(
  {
    cartId: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

// Abandoned carts are cleaned up automatically after 60 days.
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 60 });

export type CartDoc = InferSchemaType<typeof cartSchema> & { _id: Types.ObjectId };

export const Cart: Model<CartDoc> = (models.Cart as Model<CartDoc>) ?? model<CartDoc>("Cart", cartSchema);
