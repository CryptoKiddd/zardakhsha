export type CartLineDTO = {
  sku: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string;
  image: { url: string; alt: string };
  price: number;
  compareAtPrice?: number;
  quantity: number;
  stock: number;
};

export type CartDTO = {
  lines: CartLineDTO[];
  count: number;
  subtotal: number;
};

export type ActionResult = { ok: true; message?: string } | { ok: false; message: string };
