import { Field } from "@/components/ui";
import type { AddressInput, FieldErrors } from "../schemas";
import s from "./Account.module.scss";

/**
 * The address inputs, reused by the account address form AND checkout.
 * Stateless: errors/values come from whichever Server Action owns the form.
 */
export function AddressFields({
  errors = {},
  values = {},
}: {
  errors?: FieldErrors<AddressInput>;
  values?: Partial<AddressInput>;
}) {
  return (
    <div className={s.fields}>
      <Field
        label="Full name"
        name="fullName"
        autoComplete="name"
        defaultValue={values.fullName}
        error={errors.fullName}
        required
      />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+995 555 12 34 56"
        defaultValue={values.phone}
        error={errors.phone}
        required
      />
      <Field
        label="City"
        name="city"
        autoComplete="address-level2"
        defaultValue={values.city}
        error={errors.city}
        required
      />
      <Field
        label="Street and house number"
        name="street"
        autoComplete="address-line1"
        defaultValue={values.street}
        error={errors.street}
        required
      />
      <div className={s.twoCol}>
        <Field
          label="Apartment (optional)"
          name="apartment"
          autoComplete="address-line2"
          defaultValue={values.apartment}
        />
        <Field
          label="Postal code (optional)"
          name="postalCode"
          autoComplete="postal-code"
          inputMode="numeric"
          defaultValue={values.postalCode}
        />
      </div>
      <Field
        label="Delivery notes (optional)"
        name="notes"
        defaultValue={values.notes}
        hint="Floor, entrance code, best time to call"
      />
    </div>
  );
}
