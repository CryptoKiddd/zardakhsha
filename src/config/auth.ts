/** Sign-in rules shared by the server (Better Auth config) and the client (sign-in forms). */

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/**
 * Sliding sessions: a session lives 30 days from its last refresh, and is refreshed (pushed out another
 * 30 days) at most every 8 hours while the customer uses the site. Regular visitors never sign in again;
 * a device left unused for 30 days is signed out.
 */
export const SESSION_MAX_AGE_S = 30 * DAY;
export const SESSION_REFRESH_S = 8 * HOUR;

export const MAGIC_LINK_TTL_S = 15 * 60;
export const PHONE_OTP_TTL_S = 5 * 60;
export const PHONE_OTP_LENGTH = 6;
/** Seconds before "Resend code" is offered again. */
export const OTP_RESEND_COOLDOWN_S = 30;

export const DEFAULT_COUNTRY_CODE = "+995"; // Georgia

/**
 * "555 12 34 56", "0555123456" or "+995555123456" → "+995555123456" (E.164), or null if it can't be one.
 * Local numbers get the Georgian prefix; anything starting with + is taken as international.
 */
export function normalizePhone(input: string): string | null {
  const raw = input.replace(/[\s().-]/g, "");
  const e164 = raw.startsWith("+")
    ? raw
    : raw.startsWith("00")
      ? `+${raw.slice(2)}`
      : `${DEFAULT_COUNTRY_CODE}${raw.replace(/^0/, "")}`;
  return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : null;
}

/**
 * Phone sign-ups need an email to create the account; they get one on the reserved `.invalid` TLD
 * (RFC 2606), which can never receive mail. Never show it or send to it: check with isPlaceholderEmail.
 */
const PLACEHOLDER_DOMAIN = "phone.invalid";

export function placeholderEmail(phone: string): string {
  return `${phone.replace(/\D/g, "")}@${PLACEHOLDER_DOMAIN}`;
}

export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith(`@${PLACEHOLDER_DOMAIN}`);
}

/** Name for phone sign-ups. Not the phone number: first names are shown publicly on reviews. */
export const PHONE_SIGNUP_NAME = "Customer";
