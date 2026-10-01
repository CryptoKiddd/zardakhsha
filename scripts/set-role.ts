/**
 * Give someone an admin role (or take it away):
 *   npm run user:role -- you@example.com owner
 *   npm run user:role -- +995555123456 manager
 *   npm run user:role -- you@example.com customer      (removes admin access)
 * Roles: customer, owner, manager, fulfilment (config/auth.ts). The person must have signed in once.
 */
import mongoose from "mongoose";
import { USER_ROLES, type UserRole } from "../src/config/auth";

async function main() {
  const [who, role] = process.argv.slice(2);
  if (!who || !role) throw new Error("Usage: npm run user:role -- <email or phone> <role>");
  if (!(USER_ROLES as readonly string[]).includes(role))
    throw new Error(`Unknown role "${role}". One of: ${USER_ROLES.join(", ")}`);
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (.env / .env.local)");

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    // Better Auth keeps users in the "user" collection.
    const users = mongoose.connection.db!.collection("user");
    const filter = who.includes("@") ? { email: who.toLowerCase() } : { phoneNumber: who };
    const res = await users.updateOne(filter, { $set: { role: role as UserRole } });
    if (res.matchedCount === 0) throw new Error(`No user with ${who}. They need to sign in once first.`);
    console.log(`${who} is now ${role}. (Sessions refresh within 5 minutes, or sign out and in again.)`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
