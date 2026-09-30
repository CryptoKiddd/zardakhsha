/**
 * Dev seed: `npm run seed`. Wipes and recreates demo products + reviews.
 * Imports models directly (not "@/models") because that barrel is server-only.
 */
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { Review } from "../src/models/Review";

const COLORS = {
  Cobalt: { hex: "#1F3A93", img: "cobalt" },
  Turquoise: { hex: "#2A9D8F", img: "turquoise" },
  Ruby: { hex: "#9B2335", img: "ruby" },
  Emerald: { hex: "#1E6F50", img: "emerald" },
  Ivory: { hex: "#EDE6D6", img: "ivory" },
  Saffron: { hex: "#E0A526", img: "saffron" },
} as const;
type ColorName = keyof typeof COLORS;

const img = (c: ColorName, metal: "silver" | "gold", alt: string) => ({
  url: `/images/placeholder/${COLORS[c].img}-${metal}.svg`,
  alt,
});

type Seed = {
  slug: string;
  name: string;
  category: "rings" | "earrings" | "bracelets" | "pendants";
  collections: string[];
  colors: ColorName[];
  metals: ("silver" | "gold")[];
  price: number; // ₾
  goldExtra?: number;
  compareAt?: number;
  badges?: string[];
  featured?: boolean;
  sized?: boolean;
  audience?: "women" | "men" | "unisex";
  /** Demo of the second sourcing type; everything else is made in-house. */
  purchasedFrom?: string;
};

// Demo costing (tetri): in-house = materials + labour + packaging; gold adds plating material.
const LABOUR_RATE = 20_00; // ₾20 / hour
const PACKAGING = 5_00;

function costing(seed: Seed, metal: "silver" | "gold") {
  if (seed.purchasedFrom) {
    const purchasePrice = Math.round(seed.price * 100 * 0.55);
    return {
      unit: purchasePrice + 3_00,
      sourcing: { type: "purchased", supplier: seed.purchasedFrom, purchasePrice, extraCosts: 3_00 },
    };
  }
  const materials =
    Math.round(seed.price * 100 * 0.3) + (metal === "gold" ? Math.round((seed.goldExtra ?? 0) * 100 * 0.6) : 0);
  const labourMinutes = seed.sized ? 150 : 90;
  const labour = Math.round((labourMinutes / 60) * LABOUR_RATE);
  return {
    unit: materials + labour + PACKAGING,
    sourcing: { type: "in_house", materials, labourMinutes, labourRatePerHour: LABOUR_RATE, packaging: PACKAGING },
  };
}

const SEEDS: Seed[] = [
  {
    slug: "cobalt-wave-ring",
    name: "Cobalt Wave Enamel Ring",
    category: "rings",
    collections: ["wave"],
    colors: ["Cobalt", "Turquoise"],
    metals: ["silver", "gold"],
    price: 129,
    goldExtra: 60,
    badges: ["bestseller", "handmade"],
    featured: true,
    sized: true,
  },
  {
    slug: "wave-drop-earrings",
    name: "Wave Drop Earrings",
    category: "earrings",
    collections: ["wave", "gifts"],
    colors: ["Cobalt", "Turquoise"],
    metals: ["silver", "gold"],
    price: 145,
    goldExtra: 55,
    badges: ["bestseller"],
  },
  {
    slug: "wave-cuff-bracelet",
    name: "Wave Cuff Bracelet",
    category: "bracelets",
    collections: ["wave"],
    colors: ["Cobalt"],
    metals: ["silver"],
    price: 210,
    badges: ["new"],
  },
  {
    slug: "pomegranate-pendant",
    name: "Pomegranate Pendant",
    category: "pendants",
    collections: ["pomegranate", "gifts"],
    colors: ["Ruby"],
    metals: ["silver", "gold"],
    price: 115,
    goldExtra: 45,
    badges: ["bestseller", "handmade"],
    featured: true,
  },
  {
    slug: "pomegranate-studs",
    name: "Pomegranate Studs",
    category: "earrings",
    collections: ["pomegranate", "gifts"],
    colors: ["Ruby", "Saffron"],
    metals: ["silver"],
    price: 89,
    compareAt: 110,
    badges: [],
  },
  {
    slug: "pomegranate-ring",
    name: "Pomegranate Signet Ring",
    category: "rings",
    collections: ["pomegranate"],
    colors: ["Ruby"],
    metals: ["gold"],
    price: 240,
    badges: ["limited"],
    sized: true,
  },
  {
    slug: "vine-bangle",
    name: "Vine Enamel Bangle",
    category: "bracelets",
    collections: ["vine"],
    colors: ["Emerald", "Ivory"],
    metals: ["silver", "gold"],
    price: 180,
    goldExtra: 70,
    badges: ["new", "handmade"],
  },
  {
    slug: "vine-hoops",
    purchasedFrom: "Tbilisi Filigree Workshop",
    name: "Vine Hoop Earrings",
    category: "earrings",
    collections: ["vine"],
    colors: ["Emerald"],
    metals: ["gold"],
    price: 165,
    badges: ["bestseller"],
  },
  {
    slug: "saffron-sun-pendant",
    name: "Saffron Sun Pendant",
    category: "pendants",
    collections: ["sun", "gifts"],
    colors: ["Saffron", "Ivory"],
    metals: ["gold"],
    price: 135,
    badges: ["new"],
  },
  {
    slug: "ivory-stacking-ring",
    name: "Ivory Stacking Ring",
    category: "rings",
    collections: ["sun"],
    colors: ["Ivory", "Saffron", "Turquoise"],
    metals: ["silver"],
    price: 69,
    badges: ["bestseller"],
    sized: true,
  },
];

const SIZES = ["5", "6", "7", "8", "9"];

function build(seed: Seed) {
  const variants = seed.metals.flatMap((metal) =>
    seed.colors.flatMap((color) =>
      (seed.sized ? SIZES : [undefined]).map((size, i) => ({
        sku: [seed.slug, metal, color.toLowerCase(), size].filter(Boolean).join("-").toUpperCase(),
        metal,
        enamelColor: { name: color, hex: COLORS[color].hex },
        size,
        price: (seed.price + (metal === "gold" ? (seed.goldExtra ?? 0) : 0)) * 100,
        compareAtPrice: seed.compareAt ? seed.compareAt * 100 : undefined,
        cost: costing(seed, metal).unit,
        stock: i === 0 ? 2 : 8, // smallest size low-stock → shows the "Only 2 left" nudge
      })),
    ),
  );

  const images = seed.metals.flatMap((m) => seed.colors.map((c) => img(c, m, `${seed.name}, ${c} enamel, ${m}`)));

  return {
    slug: seed.slug,
    name: seed.name,
    description: `${seed.name}, handmade in our Tbilisi atelier. Glass enamel is hand-filled into ${seed.metals.join(" or ")} and kiln-fired, so every piece has its own character.`,
    category: seed.category,
    audience: seed.audience ?? (seed.category === "bracelets" ? "unisex" : "women"),
    sourcing: costing(seed, seed.metals[0]!).sourcing,
    collections: seed.collections,
    images,
    variants,
    badges: seed.badges ?? [],
    materials: "925 sterling silver or 18k gold-plated silver, vitreous glass enamel.",
    care: "Remove before swimming. Polish with a soft dry cloth.",
    featured: seed.featured ?? false,
  };
}

const REVIEW_TEXT = [
  "The color is even more beautiful in person. Arrived beautifully packaged.",
  "Bought it as a gift and my sister hasn't taken it off since.",
  "Fits true to size and feels substantial. Lovely craftsmanship.",
  "The enamel catches the light so nicely. Getting the earrings next!",
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing. Copy .env.example to .env.local");
  await mongoose.connect(uri);

  await Promise.all([Product.deleteMany({}), Review.deleteMany({})]);
  const products = await Product.insertMany(SEEDS.map(build));
  await Product.syncIndexes();

  for (const [i, p] of products.entries()) {
    const n = 2 + (i % 3);
    const ratings = Array.from({ length: n }, (_, k) => (k === 2 ? 4 : 5));
    await Review.insertMany(
      ratings.map((rating, k) => ({
        product: p._id,
        userId: `seed-user-${k}`,
        authorName: ["Nino", "Ana", "Mariam", "Tamar"][k % 4],
        rating,
        body: REVIEW_TEXT[(i + k) % REVIEW_TEXT.length],
        variantLabel: `Silver · ${p.variants[0]!.enamelColor!.name}`,
        fit: p.category === "rings" ? "true" : undefined,
        verifiedBuyer: k % 2 === 0,
      })),
    );
    const avg = ratings.reduce((a, b) => a + b, 0) / n;
    await Product.updateOne({ _id: p._id }, { rating: { average: avg, count: n } });
  }

  console.log(`Seeded ${products.length} products with reviews.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
