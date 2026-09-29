import { magicLinkClient, phoneNumberClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Browser-side auth client (sign-in forms, sign out). Same origin, so no baseURL needed. */
export const authClient = createAuthClient({ plugins: [phoneNumberClient(), magicLinkClient()] });
