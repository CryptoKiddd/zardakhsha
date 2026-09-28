import { useId, type ComponentProps } from "react";
import clsx from "clsx";
import s from "./Field.module.scss";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  /** Validation message from the Server Action (useActionState). */
  error?: string;
  hint?: string;
};

/** Labelled input wired for accessibility and server-side validation errors. */
export function Field({ label, error, hint, className, id, ...rest }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={clsx(s.field, className)}>
      <label htmlFor={inputId} className={s.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={clsx(s.input, error && s.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className={s.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className={s.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
