import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { LAST_ORDER_COOKIE } from "@/config/shop";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Order, type OrderDoc } from "@/models";
import s from "./order.module.scss";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderConfirmationPage({ params }: PageProps<"/order/[number]">) {
  const { number } = await params;
  await readDb();
  const [order, session, jar] = await Promise.all([
    Order.findOne({ number }).lean<OrderDoc>(),
    getSession(),
    cookies(),
  ]);
  // Only the buyer may see this page: same signed-in user, or the browser that placed it.
  const isOwner =
    !!order && ((!!order.userId && order.userId === session?.user.id) || jar.get(LAST_ORDER_COOKIE)?.value === number);
  if (!order || !isOwner) notFound();

  return (
    <Container className={s.page}>
      <span className={s.check}>
        <Icon name="check" size={32} />
      </span>
      <h1>Thank you!</h1>
      <p>
        Order <strong>{order.number}</strong> is confirmed. We&apos;ve sent the details to {order.email}.
      </p>
      <p className={s.total}>Total {formatPrice(order.total)}</p>
      {!order.userId && (
        <ButtonLink href="/login" variant="secondary" fullWidth>
          Create an account to track your order
        </ButtonLink>
      )}
      <ButtonLink href="/" fullWidth>
        Continue shopping
      </ButtonLink>
    </Container>
  );
}
