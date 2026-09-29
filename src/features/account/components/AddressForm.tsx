"use client";

import { useActionState } from "react";
import { Button, toast } from "@/components/ui";
import { saveAddress, type AddressFormState } from "../actions";
import { AddressFields } from "./AddressFields";
import s from "./Account.module.scss";

export function AddressForm() {
  const [state, action, pending] = useActionState<AddressFormState, FormData>(
    async (prev, fd) => {
      const res = await saveAddress(prev, fd);
      if (res.ok) toast.success(res.message ?? "Address saved", { id: "address" });
      return res;
    },
    { ok: false },
  );

  return (
    // `key` resets the uncontrolled inputs after a successful save.
    <form action={action} className={s.form} key={state.ok ? "saved" : "editing"}>
      <AddressFields errors={state.errors} values={state.values} />
      <label className={s.toggle}>
        <input type="checkbox" name="isDefault" />
        Set as default address
      </label>
      {!state.ok && state.message && (
        <p role="alert" className={s.error}>
          {state.message}
        </p>
      )}
      <Button type="submit" fullWidth loading={pending}>
        Save address
      </Button>
    </form>
  );
}
