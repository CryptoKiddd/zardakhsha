import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";
import { STATUS_LABEL, TIMELINE, timelineIndex, type OrderStatus } from "@/config/order-status";
import type { OrderDetailDTO } from "../queries";
import s from "./OrderTimeline.module.scss";

const ICON: Record<(typeof TIMELINE)[number]["key"], IconName> = {
  placed: "check",
  delivering: "truck",
  delivered: "home",
};

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Placed → Delivering → Delivered. A status, not courier tracking; cancelled orders get a notice instead. */
export function OrderTimeline({ status, reachedAt }: { status: OrderStatus; reachedAt: OrderDetailDTO["reachedAt"] }) {
  if (status === "cancelled") {
    return (
      <p className={s.cancelled} role="status">
        <Icon name="close" size={20} />
        This order was cancelled. If you paid, the refund is on its way to your card.
      </p>
    );
  }

  const current = timelineIndex(status);
  return (
    <ol className={s.timeline}>
      {TIMELINE.map((step, i) => {
        const state = i < current || status === "delivered" ? "done" : i === current ? "current" : "upcoming";
        const at = step.reachedBy.map((st) => reachedAt[st]).find(Boolean);
        return (
          <li key={step.key} className={clsx(s.step, s[state])} aria-current={state === "current" ? "step" : undefined}>
            <span className={s.marker}>
              <Icon name={state === "done" ? "check" : ICON[step.key]} size={16} />
            </span>
            <div className={s.body}>
              <p className={s.title}>
                {step.title}
                {state === "current" && status === "pending_payment" && (
                  <span className={s.tag}>{STATUS_LABEL.pending_payment}</span>
                )}
              </p>
              <p className={s.text}>{step.text}</p>
              {at && state !== "upcoming" && (
                <time className={s.time} dateTime={at}>
                  {when.format(new Date(at))}
                </time>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
