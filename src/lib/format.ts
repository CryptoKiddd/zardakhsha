const priceFormatter = new Intl.NumberFormat("en-GE", {
  style: "currency",
  currency: "GEL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Prices are stored as integers in tetri (1 ₾ = 100 tetri) to avoid float bugs. */
export function formatPrice(tetri: number): string {
  return priceFormatter.format(tetri / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}
