import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

export const addressSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  apartment: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  notes: { type: String, trim: true, maxlength: 300 },
  isDefault: { type: Boolean, default: false },
});

/**
 * Shop profile for a signed-in user. Identity (name, email, avatar) lives in
 * Better Auth's `user` collection; this holds shop data keyed by that user id.
 */
const customerSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    phone: { type: String, trim: true },
    addresses: { type: [addressSchema], default: [] },
    wishlist: { type: [{ type: Schema.Types.ObjectId, ref: "Product" }], default: [] },
  },
  { timestamps: true },
);

export type CustomerDoc = InferSchemaType<typeof customerSchema> & { _id: Types.ObjectId };

export const Customer: Model<CustomerDoc> =
  (models.Customer as Model<CustomerDoc>) ?? model<CustomerDoc>("Customer", customerSchema);
