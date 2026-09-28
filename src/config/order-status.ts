/**
 * ORDER LIFECYCLE: a small state machine, no courier tracking.
 * The shop moves an order along by hand (`npm run order:status`), or the payment webhook marks it paid.
 *
 *   pending_payment ─► paid ─► delivering ─► delivered
 *          │            │           │
 *          └────────────┴───────────┴──► cancelled
 */
export const ORDER_STATUSES = ["pending_payment", "paid", "delivering", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["delivering", "cancelled"],
  delivering: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Statuses an order may be in for `to` to be a legal next step (used as an atomic DB guard). */
export function allowedFrom(to: OrderStatus): OrderStatus[] {
  return ORDER_STATUSES.filter((s) => TRANSITIONS[s].includes(to));
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Order placed",
  delivering: "Delivering",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Customer-facing progress. An order counts as "placed" from the moment it exists. */
export const TIMELINE = [
  {
    key: "placed",
    reachedBy: ["pending_payment", "paid"],
    title: "Order placed",
    text: "We've received your order and are preparing it in the atelier.",
  },
  {
    key: "delivering",
    reachedBy: ["delivering"],
    title: "Delivering",
    text: "Your order is with our courier, who will call before arriving.",
  },
  {
    key: "delivered",
    reachedBy: ["delivered"],
    title: "Delivered",
    text: "Enjoy your piece. Returns are free for 30 days.",
  },
] as const satisfies readonly { key: string; reachedBy: readonly OrderStatus[]; title: string; text: string }[];

/** Index of the TIMELINE step the order is on, or -1 when cancelled. */
export function timelineIndex(status: OrderStatus): number {
  return TIMELINE.findIndex((step) => (step.reachedBy as readonly OrderStatus[]).includes(status));
}
