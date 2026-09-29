import "server-only";

/** Absolute origin of the shop, for URLs handed to third parties (payment redirects, callbacks, emails). */
export function siteUrl(): string {
  return (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
