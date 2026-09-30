import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const METALS = ["silver", "gold", "none"] as const; // "none": decorations without precious metal
export const PRODUCT_CATEGORIES = ["rings", "earrings", "bracelets", "pendants", "decorations"] as const;
export const PRODUCT_BADGES = ["new", "bestseller", "handmade", "limited"] as const;
export const AUDIENCES = ["women", "men", "unisex"] as const;
/** in_house: made in the atelier (cost = materials + labour + packaging). purchased: bought from a supplier. */
export const SOURCING_TYPES = ["in_house", "purchased"] as const;

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
    size: { type: String }, // rings ("5".."9"), bracelet/chain lengths; undefined for one-size items
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    /** What one unit costs the shop (tetri). Admin-only: never mapped into storefront DTOs. */
    cost: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockAt: { type: Number, min: 0 }, // overrides the shop-wide LOW_STOCK_AT
    // Decorations: physical size instead of a ring size.
    dimensions: {
      widthMm: { type: Number, min: 0 },
      heightMm: { type: Number, min: 0 },
      depthMm: { type: Number, min: 0 },
    },
    weightGrams: { type: Number, min: 0 },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
    subcategory: { type: String, trim: true, lowercase: true, index: true }, // e.g. "wall-plates"
    audience: { type: String, enum: AUDIENCES, default: "unisex", index: true },
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
    featuredRank: { type: Number }, // manual order for pinned featured pieces (lower first)
    /**
     * How the piece is made and what it costs. Admin-only (never in storefront DTOs). Amounts in tetri.
     * The breakdown is the admin's working; each variant's `cost` is what profit is calculated from.
     */
    sourcing: {
      type: { type: String, enum: SOURCING_TYPES, default: "in_house" },
      supplier: { type: String, trim: true }, // purchased: plain supplier name, not an account
      materials: { type: Number, min: 0 },
      labourMinutes: { type: Number, min: 0 },
      labourRatePerHour: { type: Number, min: 0 },
      packaging: { type: Number, min: 0 },
      purchasePrice: { type: Number, min: 0 },
      extraCosts: { type: Number, min: 0 }, // purchased: shipping / import
    },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

productSchema.index({ "variants.sku": 1 }, { unique: true });
productSchema.index({ name: "text", description: "text" });

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: import("mongoose").Types.ObjectId };

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ?? model<ProductDoc>("Product", productSchema);
