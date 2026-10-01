import "server-only";
import type { Types } from "mongoose";
import { LOW_STOCK_AT } from "@/config/shop";
import type { OrderStatus } from "@/config/order-status";
import { variantLabel } from "@/features/cart/variant-label";
import { readDb } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Order, Product, StockMovement, Transaction, type OrderDoc, type ProductDoc } from "@/models";

/** Dashboard ranges (URL: ?range=7d). Each compares with the same number of days just before it. */
export const RANGES = { "7d": 7, "30d": 30, "90d": 90 } as const;
export type RangeKey = keyof typeof RANGES;

export function parseRange(value: unknown): RangeKey {
  return typeof value === "string" && value in RANGES ? (value as RangeKey) : "30d";
}

/** Money counts once the customer has paid; unpaid and cancelled orders are not sales. */
const SOLD: OrderStatus[] = ["paid", "delivering", "delivered"];
const OPEN: OrderStatus[] = ["pending_payment", "paid", "delivering"];
const TZ_OFFSET_MS = 4 * 60 * 60 * 1000; // Tbilisi (UTC+4, no DST): days start at local midnight

export type Kpi = { value: number; previous: number; series: number[] };

export type DashboardDTO = {
  range: RangeKey;
  from: string;
  to: string;
  kpis: { revenue: Kpi; profit: Kpi; orders: Kpi; aov: Kpi; units: Kpi };
  margin: number | null; // profit / revenue for the period
  /** Lines sold without a recorded cost: profit excludes them, the UI says so. */
  linesWithoutCost: number;
  chart: { label: string; revenue: number; profit: number }[];
  openOrders: Record<"pending_payment" | "paid" | "delivering", number>;
  needsAction: {
    number: string;
    customer: string;
    city: string;
    items: number;
    total: number;
    status: OrderStatus;
    createdAt: string;
  }[];
  lowStock: { name: string; variant: string; sku: string; stock: number; threshold: number; sourcing: string }[];
  topProducts: { id: string; name: string; image: string; revenue: number; profit: number; units: number }[];
  byCategory: { key: string; revenue: number }[];
  byAudience: { key: string; revenue: number }[];
  bySourcing: { key: string; revenue: number; profit: number }[];
  activity: { at: string; kind: "order" | "payment" | "stock"; title: string; detail: string }[];
};

type LeanOrder = Pick<OrderDoc, "number" | "lines" | "total" | "discount" | "createdAt">;

function lineProfit(l: OrderDoc["lines"][number]): number | null {
  return l.unitCost == null ? null : (l.price - l.unitCost) * l.quantity;
}

function summarize(orders: LeanOrder[]) {
  let revenue = 0;
  let profit = 0;
  let units = 0;
  let noCost = 0;
  for (const o of orders) {
    revenue += o.total;
    profit -= o.discount ?? 0;
    for (const l of o.lines) {
      units += l.quantity;
      const p = lineProfit(l);
      if (p == null) noCost += 1;
      else profit += p;
    }
  }
  return { revenue, profit, units, orders: orders.length, aov: orders.length ? revenue / orders.length : 0, noCost };
}

/** Local-day buckets (weekly for 90 days) with a short label for the axis. */
function buckets(from: Date, days: number) {
  const step = days > 31 ? 7 : 1;
  const out: { start: number; label: string }[] = [];
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Tbilisi" });
  for (let d = 0; d < days; d += step) {
    const start = from.getTime() + d * 86_400_000;
    out.push({ start, label: fmt.format(new Date(start)) });
  }
  return { list: out, stepMs: step * 86_400_000 };
}

function bucketIndex(at: Date, from: Date, stepMs: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.floor((at.getTime() - from.getTime()) / stepMs)));
}

export async function getDashboard(range: RangeKey): Promise<DashboardDTO> {
  await readDb();
  const days = RANGES[range];
  // Periods end now and start at local midnight `days` days ago.
  const now = new Date();
  const localMidnight = new Date(Math.floor((now.getTime() + TZ_OFFSET_MS) / 86_400_000) * 86_400_000 - TZ_OFFSET_MS);
  const from = new Date(localMidnight.getTime() - (days - 1) * 86_400_000);
  const prevFrom = new Date(from.getTime() - days * 86_400_000);

  const projection = { number: 1, lines: 1, total: 1, discount: 1, createdAt: 1 };
  const [current, previous, openCounts, needsAction, lowStock, orderEvents, payments, moves] = await Promise.all([
    Order.find({ status: { $in: SOLD }, createdAt: { $gte: from } }, projection).lean<LeanOrder[]>(),
    Order.find({ status: { $in: SOLD }, createdAt: { $gte: prevFrom, $lt: from } }, projection).lean<LeanOrder[]>(),
    Order.aggregate<{ _id: OrderStatus; n: number }>([
      { $match: { status: { $in: OPEN } } },
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ]),
    Order.find({ status: { $in: OPEN } })
      .sort({ createdAt: 1 }) // oldest first: the ones waiting longest
      .limit(6)
      .lean<OrderDoc[]>(),
    Product.aggregate<{
      name: string;
      sourcing?: { type?: string };
      v: ProductDoc["variants"][number];
      threshold: number;
    }>([
      { $match: { isPublished: true } },
      { $unwind: "$variants" },
      { $addFields: { threshold: { $ifNull: ["$variants.lowStockAt", LOW_STOCK_AT] } } },
      { $match: { $expr: { $lte: ["$variants.stock", "$threshold"] } } },
      { $sort: { "variants.stock": 1, name: 1 } },
      { $limit: 8 },
      { $project: { name: 1, sourcing: 1, v: "$variants", threshold: 1 } },
    ]),
    Order.find({}, { number: 1, total: 1, createdAt: 1, "shippingAddress.fullName": 1 })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean<OrderDoc[]>(),
    Transaction.find({ type: "payment" }).sort({ occurredAt: -1 }).limit(6).lean(),
    StockMovement.find({ reason: { $nin: ["sale", "order_cancelled"] } })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  // Per-period totals + chart buckets
  const cur = summarize(current);
  const prev = summarize(previous);
  const { list, stepMs } = buckets(from, days);
  const series = list.map(() => ({ revenue: 0, profit: 0, orders: 0, units: 0 }));
  for (const o of current) {
    const b = series[bucketIndex(new Date(o.createdAt), from, stepMs, list.length)]!;
    b.revenue += o.total;
    b.orders += 1;
    b.profit -= o.discount ?? 0;
    for (const l of o.lines) {
      b.units += l.quantity;
      b.profit += lineProfit(l) ?? 0;
    }
  }

  // Product facts for breakdowns (one read for every product sold in the period)
  const productIds = [...new Set(current.flatMap((o) => o.lines.map((l) => String(l.product))))];
  const products = await Product.find(
    { _id: { $in: productIds } },
    { name: 1, images: { $slice: 1 }, category: 1, audience: 1, "sourcing.type": 1 },
  ).lean<ProductDoc[]>();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const add = <K extends string>(m: Map<K, { revenue: number; profit: number }>, k: K, r: number, p: number) => {
    const e = m.get(k) ?? { revenue: 0, profit: 0 };
    e.revenue += r;
    e.profit += p;
    m.set(k, e);
  };
  const perProduct = new Map<string, { revenue: number; profit: number; units: number }>();
  const cat = new Map<string, { revenue: number; profit: number }>();
  const aud = new Map<string, { revenue: number; profit: number }>();
  const src = new Map<string, { revenue: number; profit: number }>();
  for (const o of current) {
    for (const l of o.lines) {
      const id = String(l.product as Types.ObjectId);
      const p = byId.get(id);
      const revenue = l.price * l.quantity;
      const profit = lineProfit(l) ?? 0;
      const e = perProduct.get(id) ?? { revenue: 0, profit: 0, units: 0 };
      e.revenue += revenue;
      e.profit += profit;
      e.units += l.quantity;
      perProduct.set(id, e);
      add(cat, p?.category ?? "other", revenue, profit);
      add(aud, p?.audience ?? "unisex", revenue, profit);
      add(src, p?.sourcing?.type ?? "in_house", revenue, profit);
    }
  }
  const sortDesc = (m: Map<string, { revenue: number; profit: number }>) =>
    [...m].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.revenue - a.revenue);

  const openOrders = { pending_payment: 0, paid: 0, delivering: 0 };
  for (const r of openCounts) if (r._id in openOrders) openOrders[r._id as keyof typeof openOrders] = r.n;

  const activity: DashboardDTO["activity"] = [
    ...orderEvents.map((o) => ({
      at: new Date(o.createdAt).toISOString(),
      kind: "order" as const,
      title: `Order ${o.number} placed`,
      detail: `${o.shippingAddress?.fullName ?? "Customer"} · ${formatPrice(o.total)}`,
    })),
    ...payments.map((t) => ({
      at: new Date(t.occurredAt ?? t.createdAt).toISOString(),
      kind: "payment" as const,
      title: `Payment received${t.orderNumber ? ` for ${t.orderNumber}` : ""}`,
      detail: `${formatPrice(t.amount)} · Bank of Georgia`,
    })),
    ...moves.map((m) => ({
      at: new Date(m.createdAt).toISOString(),
      kind: "stock" as const,
      title: `Stock ${m.delta > 0 ? "+" : ""}${m.delta} · ${m.sku}`,
      detail: m.note ?? m.reason.replace("_", " "),
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  return {
    range,
    from: from.toISOString(),
    to: now.toISOString(),
    kpis: {
      revenue: { value: cur.revenue, previous: prev.revenue, series: series.map((s) => s.revenue) },
      profit: { value: cur.profit, previous: prev.profit, series: series.map((s) => s.profit) },
      orders: { value: cur.orders, previous: prev.orders, series: series.map((s) => s.orders) },
      aov: { value: cur.aov, previous: prev.aov, series: series.map((s) => (s.orders ? s.revenue / s.orders : 0)) },
      units: { value: cur.units, previous: prev.units, series: series.map((s) => s.units) },
    },
    margin: cur.revenue ? cur.profit / cur.revenue : null,
    linesWithoutCost: cur.noCost,
    chart: list.map((b, i) => ({ label: b.label, revenue: series[i]!.revenue, profit: series[i]!.profit })),
    openOrders,
    needsAction: needsAction.map((o) => ({
      number: o.number,
      customer: o.shippingAddress?.fullName ?? o.email,
      city: o.shippingAddress?.city ?? "",
      items: o.lines.reduce((n, l) => n + l.quantity, 0),
      total: o.total,
      status: o.status as OrderStatus,
      createdAt: new Date(o.createdAt).toISOString(),
    })),
    lowStock: lowStock.map((r) => ({
      name: r.name,
      variant: variantLabel({
        metal: r.v.metal as "silver" | "gold" | "none",
        enamelColor: { name: r.v.enamelColor!.name, hex: r.v.enamelColor!.hex },
        size: r.v.size ?? undefined,
      }),
      sku: r.v.sku,
      stock: r.v.stock,
      threshold: r.threshold,
      sourcing: r.sourcing?.type ?? "in_house",
    })),
    topProducts: [...perProduct]
      .map(([id, v]) => ({
        id,
        name: byId.get(id)?.name ?? "Removed product",
        image: byId.get(id)?.images[0]?.url ?? "",
        ...v,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5),
    byCategory: sortDesc(cat).map(({ key, revenue }) => ({ key, revenue })),
    byAudience: sortDesc(aud).map(({ key, revenue }) => ({ key, revenue })),
    bySourcing: sortDesc(src),
    activity,
  };
}
