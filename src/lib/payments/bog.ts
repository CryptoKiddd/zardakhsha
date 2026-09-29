import "server-only";
import { randomUUID } from "node:crypto";

/**
 * Bank of Georgia Online Payments (https://api.bog.ge/docs). Plain fetch, no SDK:
 *   1. OAuth2 client-credentials token (cached until it expires)
 *   2. create an e-commerce order → BOG returns its hosted payment page URL; the customer pays there
 *   3. BOG calls our callback, and redirects the customer back; either way we READ the order status from
 *      BOG (getBogOrderStatus) instead of trusting what the request says.
 * Credentials: BOG_CLIENT_ID, BOG_CLIENT_SECRET (merchant portal). Verify field names against the current
 * BOG docs when onboarding; everything BOG-specific lives in this file.
 */

const TOKEN_URL = "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const API = "https://api.bog.ge/payments/v1";

export function isBogConfigured(): boolean {
  return !!process.env.BOG_CLIENT_ID && !!process.env.BOG_CLIENT_SECRET;
}

let token: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && token.expiresAt > Date.now() + 30_000) return token.value;
  const basic = Buffer.from(`${process.env.BOG_CLIENT_ID}:${process.env.BOG_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`BOG auth failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.value;
}

/** GEL amount from integer tetri, as BOG expects (decimal, 2 places). */
const gel = (tetri: number) => Math.round(tetri) / 100;

export type BogOrderInput = {
  externalOrderId: string; // our order number
  lines: { sku: string; name: string; unitPrice: number; quantity: number }[]; // tetri
  delivery: number; // tetri
  total: number; // tetri
  callbackUrl: string;
  successUrl: string;
  failUrl: string;
  locale?: "ka" | "en";
};

/** Creates the order at BOG and returns its id + the hosted payment page to redirect the customer to. */
export async function createBogOrder(input: BogOrderInput): Promise<{ id: string; redirectUrl: string }> {
  const res = await fetch(`${API}/ecommerce/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      "Accept-Language": input.locale ?? "en",
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      callback_url: input.callbackUrl,
      external_order_id: input.externalOrderId,
      purchase_units: {
        currency: "GEL",
        total_amount: gel(input.total),
        basket: input.lines.map((l) => ({
          product_id: l.sku,
          description: l.name,
          quantity: l.quantity,
          unit_price: gel(l.unitPrice),
        })),
        delivery: { amount: gel(input.delivery) },
      },
      redirect_urls: { success: input.successUrl, fail: input.failUrl },
      ttl: 15, // minutes the payment page stays valid
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`BOG create order failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { id: string; _links: { redirect: { href: string } } };
  return { id: data.id, redirectUrl: data._links.redirect.href };
}

/** Our view of a BOG order: paid, failed for good, or still in progress. */
export type BogPaymentState = "paid" | "failed" | "pending";

const FAILED = new Set(["rejected", "blocked", "refunded", "refunded_partially"]);

export async function getBogOrderStatus(
  bogOrderId: string,
): Promise<{ state: BogPaymentState; externalOrderId: string }> {
  const res = await fetch(`${API}/receipt/${encodeURIComponent(bogOrderId)}`, {
    headers: { Authorization: `Bearer ${await accessToken()}`, "Accept-Language": "en" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`BOG receipt failed (${res.status})`);
  const data = (await res.json()) as { external_order_id: string; order_status: { key: string } };
  const key = data.order_status.key;
  return {
    state: key === "completed" ? "paid" : FAILED.has(key) ? "failed" : "pending",
    externalOrderId: data.external_order_id,
  };
}
