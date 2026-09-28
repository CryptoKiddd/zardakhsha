"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Customer } from "@/models";
import { addressSchema, fieldErrors, type AddressInput, type FieldErrors } from "./schemas";

export type AddressFormState = {
  ok: boolean;
  message?: string;
  errors?: FieldErrors<AddressInput>;
  values?: Partial<AddressInput>;
};

export async function saveAddress(_prev: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Please sign in again" };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = addressSchema.safeParse(raw);
  // Return the submitted values so the form keeps what the user typed.
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: raw };

  const makeDefault = formData.get("isDefault") === "on";
  await connectDb();
  const customer = (await Customer.findOne({ userId: session.user.id })) ?? new Customer({ userId: session.user.id });

  const isFirst = customer.addresses.length === 0;
  if (makeDefault) customer.addresses.forEach((a) => (a.isDefault = false));
  customer.addresses.push({ ...parsed.data, isDefault: makeDefault || isFirst });
  if (!customer.phone) customer.phone = parsed.data.phone;
  await customer.save();

  revalidatePath("/account/addresses");
  return { ok: true, message: "Address saved" };
}
