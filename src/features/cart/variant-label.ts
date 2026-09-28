import type { VariantDTO } from "@/features/products/types";

/** "Silver · Cobalt · Size 7". Shared by cart, orders and reviews. */
export function variantLabel(v: Pick<VariantDTO, "metal" | "enamelColor" | "size">): string {
  const metal = v.metal === "gold" ? "Gold-plated" : "Silver";
  return [metal, v.enamelColor.name, v.size ? `Size ${v.size}` : null].filter(Boolean).join(" · ");
}
