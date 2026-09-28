import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const METALS = ["silver", "gold"] as const;
export const PRODUCT_CATEGORIES = ["rings", "earrings", "bracelets", "pendants"] as const;
export const PRODUCT_BADGES = ["new", "bestseller", "handmade", "limited"] as const;

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false },
);

/** One buyable combination: metal × enamel color × size. Price in tetri. */
const variantSchema = new Schema(
  {
    sku: { type: String, required: true },
    metal: { type: String, enum: METALS, required: true },
    enamelColor: {
      name: { type: String, required: true },
      hex: { type: String, required: true },
    },
    size: { type: String }, // rings only ("5".."9"); undefined for one-size items
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
    collections: { type: [String], default: [], index: true }, // e.g. "gifts", "wave"
    images: { type: [imageSchema], validate: (v: unknown[]) => v.length > 0 },
    variants: { type: [variantSchema], validate: (v: unknown[]) => v.length > 0 },
    badges: { type: [String], enum: PRODUCT_BADGES, default: [] },
    materials: { type: String, default: "" },
    care: { type: String, default: "" },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    featured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

productSchema.index({ "variants.sku": 1 }, { unique: true });
productSchema.index({ name: "text", description: "text" });

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: import("mongoose").Types.ObjectId };

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ?? model<ProductDoc>("Product", productSchema);
