import Link, { type LinkProps } from "next/link";
import clsx from "clsx";
import s from "./Chip.module.scss";

type ChipProps<T extends string> = {
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
} & ({ href: LinkProps<T>["href"] } | ({ href?: undefined } & React.ComponentProps<"button">));

/** Pill used for quick filters, sizes and category shortcuts. Link or toggle button. */
export function Chip<T extends string>(props: ChipProps<T>) {
  const { children, selected, className } = props;
  const cls = clsx(s.chip, selected && s.selected, className);

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls} aria-current={selected ? "page" : undefined}>
        {children}
      </Link>
    );
  }

  const {
    selected: _s,
    className: _c,
    children: _ch,
    href: _h,
    type = "button",
    ...rest
  } = props as { href?: undefined; selected?: boolean; className?: string } & React.ComponentProps<"button">;
  return (
    <button type={type} className={cls} aria-pressed={selected} {...rest}>
      {children}
    </button>
  );
}
