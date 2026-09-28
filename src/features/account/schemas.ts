import { z } from "zod";

/** Shared by the account address form and checkout, so validation is identical in both. */
export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,16}$/, "Enter a valid phone number, e.g. +995 555 12 34 56"),
  city: z.string().trim().min(2, "Enter your city"),
  street: z.string().trim().min(3, "Enter street and house number"),
  apartment: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  notes: z.string().trim().max(300).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function fieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    out[key] ??= issue.message;
  }
  return out as FieldErrors<T>;
}
