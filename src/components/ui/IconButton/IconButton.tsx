import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon/Icon";
import s from "./IconButton.module.scss";

type Common = {
  icon: IconName;
  /** Required: icon-only controls must have an accessible name. */
  label: string;
  filled?: boolean;
  badge?: ReactNode;
};

type AsButton = Common & Omit<ComponentProps<"button">, "children"> & { href?: never };
type AsLink = Common & { href: ComponentProps<typeof Link>["href"]; className?: string };

/** 44x44 tap target around a 24px icon. Used in headers, cards, and bars. */
export function IconButton(props: AsButton | AsLink) {
  const { icon, label, filled, badge, className } = props;
  const content = (
    <>
      <Icon name={icon} filled={filled} />
      {badge != null && badge !== 0 && (
        <span className={s.badge} aria-hidden>
          {badge}
        </span>
      )}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} aria-label={label} className={clsx(s.iconButton, className)}>
        {content}
      </Link>
    );
  }

  const { icon: _i, label: _l, filled: _f, badge: _b, className: _c, type = "button", ...rest } = props as AsButton;
  return (
    <button type={type} aria-label={label} className={clsx(s.iconButton, className)} {...rest}>
      {content}
    </button>
  );
}
