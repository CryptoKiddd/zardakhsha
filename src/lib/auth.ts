import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { magicLink, phoneNumber } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { cache } from "react";
import {
  MAGIC_LINK_TTL_S,
  normalizePhone,
  PHONE_OTP_LENGTH,
  PHONE_OTP_TTL_S,
  PHONE_SIGNUP_NAME,
  placeholderEmail,
  type UserRole,
  SESSION_MAX_AGE_S,
  SESSION_REFRESH_S,
} from "@/config/auth";
import { escapeHtml, sendEmail, sendSms } from "./messaging";
import { siteUrl, trustedOrigins } from "./site";

/**
 * Better Auth (the maintained successor to Auth.js). Three passwordless ways in:
 * Google, a one-time code by SMS (phone funnel), or a magic link by email.
 * Users/sessions live in the same MongoDB as the shop (collections: user, session, account).
 * Built lazily so `next build` never needs secrets or a DB connection.
 */
function createAuth() {
  // Read process.env directly here: env() would throw at import time during build.
  const client = new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/zardakhsha");

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    // Resolved per environment (see lib/site.ts): on Vercel this is the deployed domain, never localhost,
    // so Google redirects back to the site the customer is on.
    baseURL: siteUrl(),
    trustedOrigins: trustedOrigins(),
    database: mongodbAdapter(client.db(), { client }),
    user: {
      additionalFields: {
        // input: false → clients can't set it at sign-up; only server code (admin panel) changes it.
        role: { type: "string", required: false, defaultValue: "customer" satisfies UserRole, input: false },
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        prompt: "select_account",
      },
    },
    session: {
      expiresIn: SESSION_MAX_AGE_S,
      updateAge: SESSION_REFRESH_S,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    plugins: [
      phoneNumber({
        otpLength: PHONE_OTP_LENGTH,
        expiresIn: PHONE_OTP_TTL_S,
        allowedAttempts: 3,
        phoneNumberValidator: (phone) => normalizePhone(phone) === phone,
        sendOTP: ({ phoneNumber: to, code }) =>
          sendSms({ to, text: `${code} is your Zardakhsha sign-in code. It expires in 5 minutes.` }),
        // First successful code creates the account (no separate sign-up step).
        signUpOnVerification: { getTempEmail: placeholderEmail, getTempName: () => PHONE_SIGNUP_NAME },
      }),
      magicLink({
        expiresIn: MAGIC_LINK_TTL_S,
        sendMagicLink: ({ email, url }) =>
          sendEmail({
            to: email,
            subject: "Your Zardakhsha sign-in link",
            text: `Sign in to Zardakhsha Atelier: ${url}

The link works once and expires in 15 minutes. If you didn't ask for it, ignore this email.`,
            html: `<p>Tap to sign in to <strong>Zardakhsha Atelier</strong>:</p><p><a href="${escapeHtml(url)}">Sign in</a></p><p>The link works once and expires in 15 minutes. If you didn't ask for it, you can ignore this email.</p>`,
          }),
      }),
      // Must be last: lets Server Actions set auth cookies.
      nextCookies(),
    ],
  });
}

type Auth = ReturnType<typeof createAuth>;
const globalForAuth = globalThis as unknown as { __auth?: Auth };

export function getAuth(): Auth {
  return (globalForAuth.__auth ??= createAuth());
}

/** Current session, de-duplicated per request with React `cache`. */
export const getSession = cache(async () => {
  return getAuth().api.getSession({ headers: await headers() });
});
