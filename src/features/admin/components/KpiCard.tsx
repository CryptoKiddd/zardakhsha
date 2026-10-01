import clsx from "clsx";
import { Icon } from "@/components/ui";
import s from "./KpiCard.module.scss";

/**
 * Stat tile: label, value, change vs the previous period (arrow + sign + colour, never colour alone) and a
 * sparkline of the period in the de-emphasis colour with the latest point marked.
 */
export function KpiCard({
  label,
  value,
  current,
  previous,
  series,
  note,
  highlight = false,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
  series: number[];
  note?: string;
  highlight?: boolean;
}) {
  const change = previous > 0 ? (current - previous) / previous : null;
  const direction = change == null || Math.abs(change) < 0.0005 ? "flat" : change > 0 ? "up" : "down";

  return (
    <article className={clsx(s.card, highlight && s.highlight)}>
      <p className={s.label}>{label}</p>
      <p className={s.value}>{value}</p>
      <p className={clsx(s.delta, s[direction])}>
        {change == null ? (
          <span className={s.muted}>No data for the previous period</span>
        ) : (
          <>
            {direction !== "flat" && <Icon name={direction === "up" ? "trend" : "trendDown"} size={16} />}
            <span>
              {change > 0 ? "+" : ""}
              {(change * 100).toFixed(1)}%
            </span>
            <span className={s.muted}>vs previous period</span>
          </>
        )}
      </p>
      {note && <p className={s.note}>{note}</p>}
      <Sparkline values={series} label={`${label} over the period`} />
    </article>
  );
}

function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2 || values.every((v) => v === 0)) return <div className={s.sparkEmpty} aria-hidden />;
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const x = (i: number) => (i / (values.length - 1)) * 100;
  const y = (v: number) => 30 - ((v - min) / span) * 26 - 2;
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");
  const last = values.length - 1;

  return (
    <div className={s.spark} role="img" aria-label={label}>
      {/* The SVG stretches to the card width, so the end dot is HTML (an SVG circle would turn oval). */}
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden>
        <path d={`${d} L100 32 L0 32 Z`} className={s.sparkArea} />
        <path d={d} className={s.sparkLine} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={s.sparkDot} style={{ left: `${x(last)}%`, top: `${(y(values[last]!) / 32) * 100}%` }} />
    </div>
  );
}
