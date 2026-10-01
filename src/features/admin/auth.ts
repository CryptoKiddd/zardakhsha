import "server-only";
import { notFound, redirect } from "next/navigation";
import type { UserRole } from "@/config/auth";
import { getSession } from "@/lib/auth";

export const STAFF_ROLES: readonly UserRole[] = ["owner", "manager", "fulfilment"];

export type StaffUser = { id: string; name: string; email: string; role: UserRole };

/**
 * Gate for every /admin page (and later every admin action). Guests go to sign-in and come back;
 * signed-in customers get a plain 404, so the admin area isn't advertised.
 */
export async function requireStaff(returnTo = "/admin"): Promise<StaffUser> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}` as "/login");
  const role = (session.user as { role?: string }).role as UserRole | undefined;
  if (!role || !STAFF_ROLES.includes(role)) notFound();
  return { id: session.user.id, name: session.user.name, email: session.user.email, role };
}
