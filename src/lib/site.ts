import "server-only";

const LOCAL = "http://localhost:3000";
const https = (host: string | undefined) => (host ? `https://${host.replace(/^https?:\/\//, "")}` : undefined);

/**
 * Absolute origin of the shop, for everything that leaves the app: OAuth callbacks (Google), magic links,
 * payment return/callback URLs. Order:
 *   1. BETTER_AUTH_URL, unless it points at localhost while running on Vercel (a copied local .env);
 *   2. on Vercel: the production domain in production, the deployment's own URL in previews;
 *   3. localhost for local development.
 */
export function siteUrl(): string {
  const explicit = process.env.BETTER_AUTH_URL?.trim();
  const onVercel = !!process.env.VERCEL;
  if (explicit && !(onVercel && /localhost|127\.0\.0\.1/.test(explicit))) return explicit.replace(/\/$/, "");

  if (onVercel) {
    const host =
      process.env.VERCEL_ENV === "production"
        ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
        : (process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL);
    const url = https(host);
    if (url) return url;
  }
  return LOCAL;
}

/** Origins allowed to start sign-in (production domain + this deployment's preview URLs). */
export function trustedOrigins(): string[] {
  return [
    siteUrl(),
    https(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    https(process.env.VERCEL_URL),
    https(process.env.VERCEL_BRANCH_URL),
  ].filter((o, i, all): o is string => !!o && all.indexOf(o) === i);
}
