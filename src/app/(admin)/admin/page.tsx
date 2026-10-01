import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/features/admin/auth";
import {
  ActivityFeed,
  CategoryBars,
  LABELS,
  OrdersNeedingAction,
  Panel,
  SplitBar,
  StockAlerts,
  TopProducts,
} from "@/features/admin/components/DashboardPanels";
import { KpiCard } from "@/features/admin/components/KpiCard";
import { RevenueChart } from "@/features/admin/components/RevenueChart";
import { getDashboard, parseRange, RANGES, type RangeKey } from "@/features/admin/dashboard";
import { formatPrice } from "@/lib/format";
import s from "./dashboard.module.scss";

export const metadata: Metadata = { title: "Dashboard" };

const RANGE_LABEL: Record<RangeKey, string> = { "7d": "7 days", "30d": "30 days", "90d": "90 days" };
/** Headline money in whole lari (₾2,714, not ₾2,714.1); exact tetri stay in tables and tooltips. */
const lari = (tetri: number) => formatPrice(Math.round(tetri / 100) * 100);

const day = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Tbilisi",
});

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  // Re-checked here, not only in the layout: layouts don't re-run on client navigations.
  await requireStaff();
  const raw = (await searchParams).range;
  const range = parseRange(Array.isArray(raw) ? raw[0] : raw);
  const d = await getDashboard(range);
  const { revenue, profit, orders, aov, units } = d.kpis;

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div>
          <p className={s.eyebrow}>Overview</p>
          <h1 className={s.title}>Dashboard</h1>
          <p className={s.period}>
            {day.format(new Date(d.from))} – {day.format(new Date(d.to))} · compared with the {RANGE_LABEL[range]}{" "}
            before
          </p>
        </div>
        <nav aria-label="Period" className={s.ranges}>
          {(Object.keys(RANGES) as RangeKey[]).map((r) => (
            <Link
              key={r}
              href={`/admin?range=${r}` as "/admin"}
              className={s.range}
              aria-current={r === range ? "page" : undefined}
              scroll={false}
            >
              {RANGE_LABEL[r]}
            </Link>
          ))}
        </nav>
      </header>

      <section className={s.kpis} aria-label="Key figures">
        <KpiCard
          label="Revenue"
          value={lari(revenue.value)}
          current={revenue.value}
          previous={revenue.previous}
          series={revenue.series}
        />
        <KpiCard
          label="Profit"
          value={lari(profit.value)}
          current={profit.value}
          previous={profit.previous}
          series={profit.series}
          note={d.margin != null ? `${Math.round(d.margin * 100)}% margin` : undefined}
          highlight
        />
        <KpiCard
          label="Orders"
          value={String(orders.value)}
          current={orders.value}
          previous={orders.previous}
          series={orders.series}
        />
        <KpiCard
          label="Average order"
          value={lari(aov.value)}
          current={aov.value}
          previous={aov.previous}
          series={aov.series}
        />
        <KpiCard
          label="Pieces sold"
          value={String(units.value)}
          current={units.value}
          previous={units.previous}
          series={units.series}
        />
      </section>

      {d.linesWithoutCost > 0 && (
        <p className={s.notice} role="note">
          {d.linesWithoutCost} sold {d.linesWithoutCost === 1 ? "line has" : "lines have"} no recorded cost, so profit
          leaves {d.linesWithoutCost === 1 ? "it" : "them"} out. Add costs to those products to complete it.
        </p>
      )}

      <div className={s.grid}>
        <Panel
          title="Revenue vs profit"
          subtitle={`${lari(revenue.value)} revenue · ${lari(profit.value)} profit`}
          className={s.span8}
        >
          <RevenueChart points={d.chart} />
        </Panel>

        <Panel title="Stock alerts" subtitle="At or below the low-stock level" className={s.span4}>
          <StockAlerts items={d.lowStock} />
        </Panel>

        <Panel title="Orders needing action" subtitle="Oldest first, so nothing waits too long" className={s.span8}>
          <OrdersNeedingAction orders={d.needsAction} counts={d.openOrders} />
        </Panel>

        <Panel title="Top pieces by profit" subtitle="Ranked by what they earned, not revenue" className={s.span4}>
          <TopProducts items={d.topProducts} />
        </Panel>

        <Panel title="Sales by category" className={s.span4}>
          <CategoryBars items={d.byCategory} />
        </Panel>

        <Panel title="Who buys, how it's made" className={s.span4}>
          <div className={s.splits}>
            <SplitBar items={d.byAudience} labels={LABELS.audience} caption="Audience" />
            <SplitBar items={d.bySourcing} labels={LABELS.sourcing} caption="Sourcing" />
          </div>
        </Panel>

        <Panel title="Recent activity" className={s.span4}>
          <ActivityFeed items={d.activity} />
        </Panel>
      </div>
    </div>
  );
}
