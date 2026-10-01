import Image from "next/image";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";
import { CATEGORIES } from "@/config/navigation";
import { STATUS_LABEL } from "@/config/order-status";
import { formatPrice } from "@/lib/format";
import type { DashboardDTO } from "../dashboard";
import s from "./DashboardPanels.module.scss";

const CATEGORY_LABEL: Record<string, string> = {
  ...Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label])),
  other: "Other",
};
const AUDIENCE_LABEL: Record<string, string> = { women: "Women", men: "Men", unisex: "Unisex" };
const SOURCING_LABEL: Record<string, string> = { in_house: "Made in-house", purchased: "Purchased" };

const ago = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return ago.format(-mins, "minute");
  if (mins < 60 * 24) return ago.format(-Math.round(mins / 60), "hour");
  return ago.format(-Math.round(mins / 1440), "day");
}

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/** Card frame shared by every panel: serif title, one supporting line, optional right-hand meta. */
export function Panel({
  title,
  subtitle,
  meta,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={clsx(s.panel, className)} aria-label={title}>
      <header className={s.head}>
        <div>
          <h2 className={s.title}>{title}</h2>
          {subtitle && <p className={s.subtitle}>{subtitle}</p>}
        </div>
        {meta && <div className={s.meta}>{meta}</div>}
      </header>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className={s.empty}>{children}</p>;
}

// ── Stock alerts ────────────────────────────────────────────
export function StockAlerts({ items }: { items: DashboardDTO["lowStock"] }) {
  if (items.length === 0) return <Empty>Every piece is above its low-stock level.</Empty>;
  return (
    <ul className={s.rows}>
      {items.map((i) => (
        <li key={i.sku} className={s.row}>
          <span className={s.rowMain}>
            <span className={s.rowTitle}>{i.name}</span>
            <span className={s.rowSub}>
              {i.variant} · {SOURCING_LABEL[i.sourcing] ?? i.sourcing}
            </span>
          </span>
          <span className={clsx(s.stockChip, i.stock === 0 && s.out)}>
            <Icon name={i.stock === 0 ? "close" : "trendDown"} size={14} />
            {i.stock === 0 ? "Out of stock" : `${i.stock} left`}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Orders needing action ───────────────────────────────────
const STATUS_ICON: Record<string, IconName> = { pending_payment: "lock", paid: "bag", delivering: "truck" };

export function OrdersNeedingAction({
  orders,
  counts,
}: {
  orders: DashboardDTO["needsAction"];
  counts: DashboardDTO["openOrders"];
}) {
  return (
    <div className={s.stack}>
      <ul className={s.statusTiles}>
        {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
          <li key={k} className={s.statusTile} data-status={k}>
            <Icon name={STATUS_ICON[k] ?? "bag"} size={18} />
            <span className={s.statusCount}>{counts[k]}</span>
            <span className={s.statusLabel}>{k === "paid" ? "To ship" : STATUS_LABEL[k]}</span>
          </li>
        ))}
      </ul>
      {orders.length === 0 ? (
        <Empty>No open orders. Everything is delivered or cancelled.</Empty>
      ) : (
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Items</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
              <th scope="col">Waiting</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.number}>
                <th scope="row" className={s.mono}>
                  {o.number}
                </th>
                <td>
                  <span className={s.cellMain}>{o.customer}</span>
                  {o.city && <span className={s.cellSub}>{o.city}</span>}
                </td>
                <td className={s.num}>{o.items}</td>
                <td className={s.num}>{formatPrice(o.total)}</td>
                <td>
                  <span className={s.status} data-status={o.status}>
                    {o.status === "paid" ? "To ship" : STATUS_LABEL[o.status]}
                  </span>
                </td>
                <td className={s.muted}>{timeAgo(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Top pieces by profit ────────────────────────────────────
export function TopProducts({ items }: { items: DashboardDTO["topProducts"] }) {
  if (items.length === 0) return <Empty>No pieces sold in this period.</Empty>;
  return (
    <ol className={s.rows}>
      {items.map((p, i) => (
        <li key={p.id} className={s.row}>
          <span className={s.rank}>{i + 1}</span>
          <span className={s.thumb}>{p.image && <Image src={p.image} alt="" fill sizes="44px" />}</span>
          <span className={s.rowMain}>
            <span className={s.rowTitle}>{p.name}</span>
            <span className={s.rowSub}>
              {p.units} sold · {formatPrice(p.revenue)} revenue
            </span>
          </span>
          <span className={s.rowValue}>
            <strong>{formatPrice(p.profit)}</strong>
            <span>{pct(p.profit, p.revenue)}% margin</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// ── Sales by category (single-hue bars: magnitude) ──────────
export function CategoryBars({ items }: { items: DashboardDTO["byCategory"] }) {
  const total = items.reduce((n, i) => n + i.revenue, 0);
  if (total === 0) return <Empty>No sales in this period.</Empty>;
  const max = Math.max(...items.map((i) => i.revenue));
  return (
    <ul className={s.bars}>
      {items.map((i) => (
        <li key={i.key}>
          <span className={s.barLabel}>{CATEGORY_LABEL[i.key] ?? i.key}</span>
          <span className={s.barValue}>
            {formatPrice(i.revenue)} <span>{pct(i.revenue, total)}%</span>
          </span>
          <span className={s.barTrack} aria-hidden>
            <span className={s.barFill} style={{ width: `${(i.revenue / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Part-to-whole split (stacked bar + legend with values) ──
export function SplitBar({
  items,
  labels,
  caption,
}: {
  items: { key: string; revenue: number }[];
  labels: Record<string, string>;
  caption: string;
}) {
  const total = items.reduce((n, i) => n + i.revenue, 0);
  if (total === 0) return <Empty>No sales in this period.</Empty>;
  return (
    <figure className={s.split}>
      <figcaption className={s.splitCaption}>{caption}</figcaption>
      <span className={s.splitBar} aria-hidden>
        {items.map((i, n) => (
          <span key={i.key} className={s.splitSeg} data-slot={n + 1} style={{ flexGrow: i.revenue }} />
        ))}
      </span>
      <ul className={s.splitLegend}>
        {items.map((i, n) => (
          <li key={i.key}>
            <span className={s.swatch} data-slot={n + 1} aria-hidden />
            <span className={s.splitName}>{labels[i.key] ?? i.key}</span>
            <strong>{pct(i.revenue, total)}%</strong>
            <span className={s.muted}>{formatPrice(i.revenue)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export const LABELS = { audience: AUDIENCE_LABEL, sourcing: SOURCING_LABEL };

// ── Recent activity ─────────────────────────────────────────
const ACTIVITY_ICON: Record<DashboardDTO["activity"][number]["kind"], IconName> = {
  order: "bag",
  payment: "check",
  stock: "sliders",
};

export function ActivityFeed({ items }: { items: DashboardDTO["activity"] }) {
  if (items.length === 0) return <Empty>Nothing has happened yet.</Empty>;
  return (
    <ul className={s.rows}>
      {items.map((a) => (
        <li key={a.kind + a.at + a.title} className={s.row}>
          <span className={s.activityIcon} data-kind={a.kind}>
            <Icon name={ACTIVITY_ICON[a.kind]} size={16} />
          </span>
          <span className={s.rowMain}>
            <span className={s.rowTitle}>{a.title}</span>
            <span className={s.rowSub}>{a.detail}</span>
          </span>
          <time className={s.muted} dateTime={a.at}>
            {timeAgo(a.at)}
          </time>
        </li>
      ))}
    </ul>
  );
}
