import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

export const FIT_VALUES = ["small", "true", "large"] as const;

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String, required: true, maxlength: 2000 },
    variantLabel: { type: String }, // "Silver · Cobalt · Size 7"
    fit: { type: String, enum: FIT_VALUES },
    photos: { type: [String], default: [] },
    verifiedBuyer: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One review per user per product.
reviewSchema.index({ product: 1, userId: 1 }, { unique: true });

export type ReviewDoc = InferSchemaType<typeof reviewSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const Review: Model<ReviewDoc> = (models.Review as Model<ReviewDoc>) ?? model<ReviewDoc>("Review", reviewSchema);
