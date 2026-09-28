import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { Customer, Order, type CustomerDoc, type OrderDoc } from "@/models";

export type AddressDTO = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  street: string;
  apartment?: string;
  postalCode?: string;
  notes?: string;
  isDefault: boolean;
};

export type OrderSummaryDTO = {
  id: string;
  number: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
};

/** Use at the top of every /account page. Redirects guests to login and back again afterwards. */
export async function requireUser(returnTo: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session.user;
}

export async function getAddresses(userId: string): Promise<AddressDTO[]> {
  await readDb();
  const c = await Customer.findOne({ userId }, { addresses: 1 }).lean<CustomerDoc>();
  return (c?.addresses ?? []).map((a) => ({
    id: String((a as { _id?: unknown })._id),
    fullName: a.fullName,
    phone: a.phone,
    city: a.city,
    street: a.street,
    apartment: a.apartment ?? undefined,
    postalCode: a.postalCode ?? undefined,
    notes: a.notes ?? undefined,
    isDefault: a.isDefault,
  }));
}

export async function getOrders(userId: string, limit = 20): Promise<OrderSummaryDTO[]> {
  await readDb();
  const docs = await Order.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean<OrderDoc[]>();
  return docs.map((o) => ({
    id: String(o._id),
    number: o.number,
    status: o.status,
    total: o.total,
    itemCount: o.lines.reduce((n, l) => n + l.quantity, 0),
    createdAt: new Date(o.createdAt).toISOString(),
  }));
}
