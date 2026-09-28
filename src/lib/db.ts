import "server-only";
import mongoose from "mongoose";
import { connection } from "next/server";
import { env } from "./env";

/**
 * One cached Mongoose connection per server process.
 * The global cache survives hot reloads in dev, so we don't open a new pool on every save.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForDb = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = (globalForDb.__mongoose ??= { conn: null, promise: null });

export async function connectDb(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(env().MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 10,
  });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}

/**
 * Use in READ queries (features/*\/queries.ts). `connection()` tells Next.js this
 * render depends on live data, so the page is rendered per request instead of
 * being prerendered at build time (where there is no database).
 */
export async function readDb(): Promise<typeof mongoose> {
  await connection();
  return connectDb();
}
