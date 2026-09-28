import type { Route } from "next";
import Link from "next/link";
import clsx from "clsx";
import s from "./Section.module.scss";

/** Page section with the standard heading row ("Bestsellers ....... View all"). */
export function Section({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title?: string;
  eyebrow?: string;
  action?: { label: string; href: Route };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx(s.section, className)}>
      {(title || action) && (
        <div className={s.head}>
          <div>
            {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
            {title && <h2 className={s.title}>{title}</h2>}
          </div>
          {action && (
            <Link href={action.href} className={s.action}>
              {action.label}
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/** Horizontal page padding + max width. Every page body sits inside one. */
export function Container({ children, className, ...rest }: React.ComponentProps<"div">) {
  return (
    <div className={clsx(s.container, className)} {...rest}>
      {children}
    </div>
  );
}
