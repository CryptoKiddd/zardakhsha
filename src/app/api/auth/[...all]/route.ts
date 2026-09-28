import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// Handler is resolved per request so the auth instance (and its DB client) is created lazily.
export async function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request);
}
