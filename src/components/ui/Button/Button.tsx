import Link, { type LinkProps } from "next/link";
import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import s from "./Button.module.scss";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

type StyleProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
};

function classes({ variant = "primary", size = "lg", fullWidth }: StyleProps, className?: string) {
  return clsx(s.button, s[variant], s[size], fullWidth && s.fullWidth, className);
}

export type ButtonProps = ComponentProps<"button"> &
  StyleProps & {
    /** Shows a spinner and disables the button (e.g. while a Server Action runs). */
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  fullWidth,
  iconStart,
  iconEnd,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={s.spinner} aria-hidden /> : iconStart}
      <span>{children}</span>
      {!loading && iconEnd}
    </button>
  );
}

type ButtonLinkProps<T extends string> = LinkProps<T> & StyleProps & { className?: string; children: ReactNode };

/** Same look as <Button>, but navigates. Use for CTAs like "Shop New Collection". */
export function ButtonLink<T extends string>({
  variant,
  size,
  fullWidth,
  iconStart,
  iconEnd,
  className,
  children,
  ...rest
}: ButtonLinkProps<T>) {
  return (
    <Link className={classes({ variant, size, fullWidth }, className)} {...rest}>
      {iconStart}
      <span>{children}</span>
      {iconEnd}
    </Link>
  );
}
