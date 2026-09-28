import { createAuthClient } from "better-auth/react";

/** Browser-side auth client (sign in / sign out buttons). Same origin, so no baseURL needed. */
export const authClient = createAuthClient();
