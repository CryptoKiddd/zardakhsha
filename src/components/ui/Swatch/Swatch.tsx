import clsx from "clsx";
import s from "./Swatch.module.scss";

/** Color dot for enamel colors / metals. Decorative on cards, interactive in VariantSelector. */
export function Swatch({
  color,
  label,
  size = "md",
  selected,
  className,
}: {
  color: string;
  label: string;
  size?: "sm" | "md";
  selected?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(s.swatch, s[size], selected && s.selected, className)}
      style={{ "--swatch": color } as React.CSSProperties}
      title={label}
    />
  );
}

export function SwatchRow({ colors, max = 4 }: { colors: { hex: string; name: string }[]; max?: number }) {
  const shown = colors.slice(0, max);
  const extra = colors.length - shown.length;
  return (
    <span className={s.row} aria-label={`${colors.length} colors`}>
      {shown.map((c) => (
        <Swatch key={c.name} color={c.hex} label={c.name} size="sm" />
      ))}
      {extra > 0 && <span className={s.more}>+{extra}</span>}
    </span>
  );
}
