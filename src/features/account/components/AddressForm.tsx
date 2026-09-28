"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { saveAddress, type AddressFormState } from "../actions";
import { AddressFields } from "./AddressFields";
import s from "./Account.module.scss";

export function AddressForm() {
  const [state, action, pending] = useActionState<AddressFormState, FormData>(saveAddress, { ok: false });

  return (
    // `key` resets the uncontrolled inputs after a successful save.
    <form action={action} className={s.form} key={state.ok ? "saved" : "editing"}>
      <AddressFields errors={state.errors} values={state.values} />
      <label className={s.toggle}>
        <input type="checkbox" name="isDefault" />
        Set as default address
      </label>
      <p role="status" className={state.ok ? s.success : s.error}>
        {state.message}
      </p>
      <Button type="submit" fullWidth loading={pending}>
        Save address
      </Button>
    </form>
  );
}
