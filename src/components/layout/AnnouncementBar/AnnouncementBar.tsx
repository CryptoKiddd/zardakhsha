import { FREE_SHIPPING_THRESHOLD } from "@/config/shop";
import { formatPrice } from "@/lib/format";
import s from "./AnnouncementBar.module.scss";

/** Scrolls away above the sticky header (only on Header A screens). */
export function AnnouncementBar() {
  return <p className={s.bar}>Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)} · 30-day returns</p>;
}
