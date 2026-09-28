import clsx from "clsx";
import s from "./Badge.module.scss";

export type BadgeTone = "neutral" | "accent" | "sale" | "gold";

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={clsx(s.badge, s[tone], className)}>{children}</span>;
}
