/**
 * Demo decorations: `npm run seed:decorations` (also run by `npm run seed`).
 * Upserts by slug, so it's safe to re-run and never touches other products.
 * Imports models directly (not "@/models") because that barrel is server-only.
 */
import mongoose from "mongoose";
import { Product } from "../src/models/Product";

type Decoration = {
  slug: string;
  name: string;
  subcategory: string;
  art: string; // public/images/placeholder/decor-<art>.svg
  color: { name: string; hex: string };
  price: number; // ₾
  size: { widthMm: number; heightMm: number; depthMm?: number };
  weightGrams: number;
  stock: number;
  badges?: string[];
  /** Shown in the Home decorations showcase. */
  spotlight?: boolean;
  purchasedFrom?: string;
  description: string;
};

export const DECORATIONS: Decoration[] = [
  {
    slug: "cobalt-wave-vase",
    name: "Cobalt Wave Vase",
    subcategory: "vases",
    art: "vase-cobalt",
    color: { name: "Cobalt", hex: "#1F3A93" },
    price: 240,
    size: { widthMm: 180, heightMm: 320, depthMm: 180 },
    weightGrams: 640,
    stock: 4,
    badges: ["new", "handmade"],
    spotlight: true,
    description: "A tall vase wrapped in cobalt enamel waves and gold bands. Beautiful empty, better with dried stems.",
  },
  {
    slug: "pomegranate-plant-pot",
    name: "Pomegranate Plant Pot",
    subcategory: "plant-pots",
    art: "pot-turquoise",
    color: { name: "Turquoise", hex: "#2A9D8F" },
    price: 180,
    size: { widthMm: 160, heightMm: 150, depthMm: 160 },
    weightGrams: 820,
    stock: 6,
    badges: ["handmade"],
    spotlight: true,
    description:
      "Turquoise enamel pot with a hand-painted pomegranate, the Georgian symbol of abundance. Fits a 14 cm plant.",
  },
  {
    slug: "ruby-wall-plate",
    name: "Ruby Wall Plate",
    subcategory: "wall-plates",
    art: "plate-ruby",
    color: { name: "Ruby", hex: "#9B2335" },
    price: 210,
    size: { widthMm: 280, heightMm: 280, depthMm: 30 },
    weightGrams: 900,
    stock: 3,
    badges: ["limited"],
    description: "A decorative plate with a four-petal enamel motif and gilded rim, ready to hang.",
  },
  {
    slug: "emerald-trinket-box",
    name: "Emerald Trinket Box",
    subcategory: "boxes",
    art: "box-emerald",
    color: { name: "Emerald", hex: "#1E6F50" },
    price: 150,
    size: { widthMm: 120, heightMm: 80, depthMm: 90 },
    weightGrams: 320,
    stock: 5,
    description: "A lidded enamel box for rings and earrings, lined in soft velvet.",
  },
  {
    slug: "ivory-bud-vase",
    name: "Ivory Bud Vase",
    subcategory: "vases",
    art: "vase-ivory",
    color: { name: "Ivory", hex: "#EDE6D6" },
    price: 130,
    size: { widthMm: 90, heightMm: 220, depthMm: 90 },
    weightGrams: 380,
    stock: 6,
    purchasedFrom: "Tbilisi Ceramics Studio",
    description: "A slim ivory vase with enamel bands, made for a single stem.",
  },
  {
    slug: "saffron-candle-holder",
    name: "Saffron Candle Holder",
    subcategory: "candle-holders",
    art: "candle-saffron",
    color: { name: "Saffron", hex: "#E0A526" },
    price: 95,
    size: { widthMm: 100, heightMm: 110, depthMm: 100 },
    weightGrams: 450,
    stock: 8,
    description: "A warm saffron holder with a cobalt wave, for pillar candles up to 6 cm.",
  },
];

const LABOUR_RATE = 20_00; // ₾20 / hour, as in seed.ts
const PACKAGING = 8_00; // decorations ship in sturdier boxes

function build(d: Decoration) {
  const purchasePrice = Math.round(d.price * 100 * 0.5);
  const materials = Math.round(d.price * 100 * 0.25);
  const labourMinutes = 180;
  const cost = d.purchasedFrom
    ? purchasePrice + 5_00
    : materials + Math.round((labourMinutes / 60) * LABOUR_RATE) + PACKAGING;

  return {
    slug: d.slug,
    name: d.name,
    description: d.description,
    category: "decorations",
    subcategory: d.subcategory,
    audience: "unisex",
    collections: d.spotlight ? ["decor-spotlight"] : [],
    images: [{ url: `/images/placeholder/decor-${d.art}.svg`, alt: `${d.name}, ${d.color.name.toLowerCase()} enamel` }],
    variants: [
      {
        sku: d.slug.toUpperCase(),
        metal: "none",
        enamelColor: d.color,
        price: d.price * 100,
        cost,
        stock: d.stock,
        dimensions: d.size,
        weightGrams: d.weightGrams,
      },
    ],
    badges: d.badges ?? [],
    materials: "Copper body, vitreous glass enamel, 24k gold lustre accents.",
    care: "Wipe with a soft damp cloth. Not dishwasher safe.",
    featured: false,
    sourcing: d.purchasedFrom
      ? { type: "purchased", supplier: d.purchasedFrom, purchasePrice, extraCosts: 5_00 }
      : { type: "in_house", materials, labourMinutes, labourRatePerHour: LABOUR_RATE, packaging: PACKAGING },
  };
}

/** Upserts every decoration by slug. Returns how many were written. */
export async function upsertDecorations(): Promise<number> {
  for (const d of DECORATIONS) {
    await Product.updateOne({ slug: d.slug }, { $set: build(d) }, { upsert: true });
  }
  return DECORATIONS.length;
}

// Run directly: `tsx scripts/seed-decorations.ts`
if (process.argv[1]?.includes("seed-decorations")) {
  (async () => {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (.env / .env.local)");
    await mongoose.connect(process.env.MONGODB_URI);
    try {
      console.log(`Upserted ${await upsertDecorations()} decorations.`);
    } finally {
      await mongoose.disconnect();
    }
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
