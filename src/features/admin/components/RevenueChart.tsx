"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import s from "./RevenueChart.module.scss";

type Point = { label: string; revenue: number; profit: number };

const SERIES = [
  { key: "revenue", label: "Revenue", className: "revenue" },
  { key: "profit", label: "Profit", className: "profit" },
] as const;

/** Clean tick step: 1 / 2 / 5 × 10ⁿ lari, so the axis reads ₾0, ₾250, ₾500 (never ₾748,33). */
function niceStep(range: number): number {
  const raw = Math.max(range, 100_00) / 4;
  const exp = 10 ** Math.floor(Math.log10(raw));
  const f = raw / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
}

/**
 * Revenue vs profit over the period: one ₾ axis (never two), 2px lines, a 10% wash under revenue,
 * hairline grid. Hover or arrow keys move a crosshair with a tooltip; "View as table" has every value.
 */
export function RevenueChart({ points }: { points: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const empty = points.every((p) => p.revenue === 0 && p.profit === 0);

  // Top snaps to a whole step; the bottom is 0, or just below the lowest profit when a day lost money
  // (a small dip shouldn't waste a whole tick band). Ticks sit only on whole steps inside the range.
  const hi = Math.max(0, ...points.flatMap((p) => [p.revenue, p.profit]));
  const lo = Math.min(0, ...points.map((p) => p.profit));
  const step = niceStep(hi - lo);
  const max = Math.max(Math.ceil(hi / step) * step, step);
  const min = lo < 0 ? lo - (max - lo) * 0.04 : 0;
  const ticks = Array.from(
    { length: Math.floor(max / step) - Math.ceil(min / step) + 1 },
    (_, i) => (Math.ceil(min / step) + i) * step,
  );
  const x = (i: number) => (points.length === 1 ? 50 : (i / (points.length - 1)) * 100);
  const y = (v: number) => 100 - ((v - min) / (max - min)) * 100;
  const path = (key: "revenue" | "profit") =>
    points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(3)} ${y(p[key]).toFixed(3)}`).join(" ");

  // At most ~8 axis labels so they never collide (the rest are in the tooltip and table).
  const labelEvery = Math.max(1, Math.ceil(points.length / 8));

  function pick(clientX: number, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const i = Math.round(((clientX - r.left) / r.width) * (points.length - 1));
    setActive(Math.max(0, Math.min(points.length - 1, i)));
  }

  const a = active != null ? points[active] : null;

  return (
    <div className={s.chart}>
      <ul className={s.legend} aria-label="Legend">
        {SERIES.map((ser) => (
          <li key={ser.key}>
            <span className={`${s.key} ${s[ser.className]}`} aria-hidden />
            {ser.label}
          </li>
        ))}
      </ul>

      {empty ? (
        <p className={s.empty}>No sales in this period yet.</p>
      ) : (
        <div className={s.frame}>
          <ol className={s.yAxis} aria-hidden>
            {ticks.map((t) => (
              <li key={t} style={{ top: `${y(t)}%` }}>
                {formatPrice(Math.round(t))}
              </li>
            ))}
          </ol>

          <div
            className={s.plot}
            tabIndex={0}
            role="img"
            aria-label="Revenue and profit over the period. Use the arrow keys to read values, or open the table below."
            onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
            onPointerLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              const step = e.key === "ArrowRight" ? 1 : -1;
              setActive((i) => Math.max(0, Math.min(points.length - 1, (i ?? (step > 0 ? -1 : points.length)) + step)));
            }}
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {ticks.map((t) => (
                <line
                  key={t}
                  x1="0"
                  x2="100"
                  y1={y(t)}
                  y2={y(t)}
                  className={s.grid}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path d={`${path("revenue")} L100 ${y(0)} L0 ${y(0)} Z`} className={s.wash} />
              {SERIES.map((ser) => (
                <path
                  key={ser.key}
                  d={path(ser.key)}
                  className={`${s.line} ${s[ser.className]}`}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {a && active != null && (
              <>
                <span className={s.crosshair} style={{ left: `${x(active)}%` }} aria-hidden />
                {SERIES.map((ser) => (
                  <span
                    key={ser.key}
                    className={`${s.dot} ${s[ser.className]}`}
                    style={{ left: `${x(active)}%`, top: `${y(a[ser.key])}%` }}
                    aria-hidden
                  />
                ))}
                <div
                  className={s.tooltip}
                  data-side={x(active) > 60 ? "left" : "right"}
                  style={{ left: `${x(active)}%` }}
                  role="status"
                >
                  <p className={s.tipDate}>{a.label}</p>
                  {SERIES.map((ser) => (
                    <p key={ser.key} className={s.tipRow}>
                      <span className={`${s.key} ${s[ser.className]}`} aria-hidden />
                      <span>{ser.label}</span>
                      <strong>{formatPrice(a[ser.key])}</strong>
                    </p>
                  ))}
                  <p className={s.tipMargin}>
                    Margin {a.revenue ? `${Math.round((a.profit / a.revenue) * 100)}%` : "—"}
                  </p>
                </div>
              </>
            )}
          </div>

          <ol className={s.xAxis} aria-hidden>
            {points.map((p, i) => (
              <li key={p.label + i} style={{ left: `${x(i)}%` }}>
                {/* Every nth label plus the last, skipping any that would crowd the last one. */}
                {i === points.length - 1 || (i % labelEvery === 0 && points.length - 1 - i >= labelEvery)
                  ? p.label
                  : ""}
              </li>
            ))}
          </ol>
        </div>
      )}

      <details className={s.table}>
        <summary>View as table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Revenue</th>
              <th scope="col">Profit</th>
              <th scope="col">Margin</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={p.label + i}>
                <th scope="row">{p.label}</th>
                <td>{formatPrice(p.revenue)}</td>
                <td>{formatPrice(p.profit)}</td>
                <td>{p.revenue ? `${Math.round((p.profit / p.revenue) * 100)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
