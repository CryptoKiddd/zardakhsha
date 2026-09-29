import "server-only";

/**
 * Outbound email + SMS for sign-in. Providers are plain HTTP APIs (no SDKs):
 *   Email: Resend  (RESEND_API_KEY, EMAIL_FROM)
 *   SMS:   Twilio  (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM)
 * In development without keys, messages are printed to the server console so sign-in can be tested.
 * In production a missing provider is an error: a code or link must never silently go nowhere.
 */

const isProd = process.env.NODE_ENV === "production";

function devFallback(kind: "email" | "sms", to: string, body: string): void {
  if (isProd) throw new Error(`No ${kind} provider configured (see lib/messaging.ts); cannot send to ${to}`);
  console.info(`\n[dev ${kind}] to ${to}\n${body}\n`);
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return devFallback("email", to, `${subject}\n${text}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text, html }),
  });
  if (!res.ok) throw new Error(`Email send failed (${res.status}): ${await res.text()}`);
}

export async function sendSms({ to, text }: { to: string; text: string }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return devFallback("sms", to, text);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: text }),
  });
  if (!res.ok) throw new Error(`SMS send failed (${res.status}): ${await res.text()}`);
}

/** Minimal escaping for values interpolated into email HTML. */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
