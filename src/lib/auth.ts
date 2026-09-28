import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * Better Auth (the maintained successor to Auth.js) with Google sign-in.
 * Users/sessions live in the same MongoDB as the shop (collections: user, session, account).
 * Built lazily so `next build` never needs secrets or a DB connection.
 */
function createAuth() {
  // Read process.env directly here: env() would throw at import time during build.
  const client = new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/zardakhsha");

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: mongodbAdapter(client.db(), { client }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        prompt: "select_account",
      },
    },
    session: {
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    // Must be last: lets Server Actions set auth cookies.
    plugins: [nextCookies()],
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
