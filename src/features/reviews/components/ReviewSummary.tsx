import { Rating } from "@/components/ui";
import type { ReviewSummaryDTO } from "../queries";
import s from "./Reviews.module.scss";

export function ReviewSummary({ summary }: { summary: ReviewSummaryDTO }) {
  return (
    <div className={s.summary}>
      <div className={s.score}>
        <p className={s.big}>{summary.average.toFixed(1)}</p>
        <Rating value={summary.average} size={16} />
        <p className={s.muted}>{summary.count} reviews</p>
      </div>
      <ul className={s.bars}>
        {summary.breakdown.map((n, i) => (
          <li key={i} className={s.barRow}>
            <span>{5 - i}★</span>
            <meter min={0} max={summary.count || 1} value={n} className={s.meter} aria-label={`${5 - i} stars`} />
            <span className={s.muted}>{n}</span>
          </li>
        ))}
      </ul>
      {summary.count > 0 && <p className={s.recommend}>{summary.recommendPct}% would recommend</p>}
    </div>
  );
}
