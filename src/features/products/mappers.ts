import type { ProductDoc } from "@/models/Product";
import type { ProductCardDTO, ProductDetailDTO, VariantDTO } from "./types";

type LeanProduct = ProductDoc;

function variants(p: LeanProduct): VariantDTO[] {
  return p.variants.map((v) => ({
    sku: v.sku,
    metal: v.metal as VariantDTO["metal"],
    enamelColor: { name: v.enamelColor!.name, hex: v.enamelColor!.hex },
    size: v.size ?? undefined,
    price: v.price,
    compareAtPrice: v.compareAtPrice ?? undefined,
    stock: v.stock,
  }));
}

const METAL_LABEL = { silver: "925 silver", gold: "gold" } as const;

function subtitle(vs: VariantDTO[], colors: VariantDTO["enamelColor"][]): string {
  const metals = [...new Set(vs.map((v) => v.metal))];
  const metal = metals.length > 1 ? "Silver or gold" : METAL_LABEL[metals[0]!];
  const enamel = colors.length === 1 ? `${colors[0]!.name} enamel` : `${colors.length} enamel colors`;
  return `${enamel} · ${metal}`;
}

export function toProductCard(p: LeanProduct): ProductCardDTO {
  const vs = variants(p);
  const cheapest = vs.reduce((min, v) => (v.price < min.price ? v : min), vs[0]!);
  const colors = [...new Map(vs.map((v) => [v.enamelColor.name, v.enamelColor])).values()];

  return {
    id: String(p._id),
    slug: p.slug,
    name: p.name,
    category: p.category,
    subtitle: subtitle(vs, colors),
    image: { url: p.images[0]!.url, alt: p.images[0]!.alt },
    hoverImage: p.images[1] ? { url: p.images[1].url, alt: p.images[1].alt } : undefined,
    price: cheapest.price,
    compareAtPrice: cheapest.compareAtPrice,
    colors,
    badges: [...p.badges],
    rating: { average: p.rating?.average ?? 0, count: p.rating?.count ?? 0 },
    quickAddSku: vs.find((v) => v.stock > 0 && !v.size)?.sku,
  };
}

export function toProductDetail(p: LeanProduct): ProductDetailDTO {
  return {
    ...toProductCard(p),
    description: p.description,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    variants: variants(p),
    materials: p.materials ?? "",
    care: p.care ?? "",
  };
}
