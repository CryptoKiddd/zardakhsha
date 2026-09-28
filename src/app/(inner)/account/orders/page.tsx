import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Container } from "@/components/ui";
import { routes } from "@/config/navigation";
import { isOrderStatus, STATUS_LABEL } from "@/config/order-status";
import s from "@/features/account/components/AccountPage.module.scss";
import { getOrders, requireUser } from "@/features/account/queries";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await getOrders(user.id);

  return (
    <Container className={s.page}>
      <h1>Orders</h1>
      {orders.length === 0 ? (
        <>
          <p className={s.muted}>You haven&apos;t placed any orders yet.</p>
          <ButtonLink href="/shop/new">Start shopping</ButtonLink>
        </>
      ) : (
        <ul className={s.list}>
          {orders.map((o) => (
            <li key={o.id} className={s.row}>
              <span>
                <Link href={routes.order(o.number)}>
                  <strong>{o.number}</strong>
                </Link>
                <span className={s.muted}>
                  {formatDate(o.createdAt)} · {o.itemCount} items
                </span>
              </span>
              <span>
                <strong>{formatPrice(o.total)}</strong>
                <span className={s.muted}>{isOrderStatus(o.status) ? STATUS_LABEL[o.status] : o.status}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
