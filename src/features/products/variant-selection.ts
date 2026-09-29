// Metal → enamel colour → size selection, shared by the product page and the card's quick-add sheet.
import { useState } from "react";
import type { Metal, VariantDTO } from "./types";

export const METAL_LABEL: Record<Metal, string> = { silver: "925 Sterling Silver", gold: "Gold-plated" };

/** Inner circumference per ring size (US), shown on the size tiles and in the guide. */
export const RING_SIZE_MM: Record<string, string> = {
  "5": "49.3",
  "6": "51.9",
  "7": "54.4",
  "8": "57.0",
  "9": "59.5",
};

function unique<T>(items: T[], key: (t: T) => string): T[] {
  return [...new Map(items.map((i) => [key(i), i])).values()];
}

export type VariantSelection = ReturnType<typeof useVariantSelection>;

/** Starts on the first in-stock metal/colour; size is always an explicit choice (never guessed). */
export function useVariantSelection(variants: VariantDTO[]) {
  const first = variants.find((v) => v.stock > 0) ?? variants[0]!;
  const [metal, setMetalState] = useState<Metal>(first.metal);
  const [color, setColor] = useState(first.enamelColor.name);
  const [size, setSize] = useState<string | undefined>(undefined);

  const metals = unique(variants, (v) => v.metal).map((v) => v.metal);
  const colors = unique(
    variants.filter((v) => v.metal === metal),
    (v) => v.enamelColor.name,
  ).map((v) => v.enamelColor);
  const sizes = variants.filter((v) => v.metal === metal && v.enamelColor.name === color && v.size);
  const needsSize = sizes.length > 0;

  // Derived during render (no effect): the variant matching the current choices, if complete.
  const selected = variants.find(
    (v) => v.metal === metal && v.enamelColor.name === color && (needsSize ? v.size === size : true),
  );
  const display = selected ?? variants.find((v) => v.metal === metal && v.enamelColor.name === color) ?? first;
  const soldOut = selected ? selected.stock === 0 : false;

  function setMetal(m: Metal) {
    setMetalState(m);
    // Keep the colour if the new metal has it, otherwise take that metal's first colour.
    if (!variants.some((v) => v.metal === m && v.enamelColor.name === color)) {
      setColor(variants.find((v) => v.metal === m)!.enamelColor.name);
    }
  }

  return {
    metal,
    color,
    size,
    metals,
    colors,
    sizes,
    needsSize,
    selected,
    display,
    soldOut,
    missingSize: needsSize && !size,
    setMetal,
    setColor,
    setSize,
  };
}
