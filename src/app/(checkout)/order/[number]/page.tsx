import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Container, CopyButton, Icon } from "@/components/ui";
import { STATUS_LABEL } from "@/config/order-status";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import { getOrderForViewer } from "@/features/orders/queries";
import { formatPrice } from "@/lib/format";
import s from "./order.module.scss";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({ params }: PageProps<"/order/[number]">) {
  const { number } = await params;
  const order = await getOrderForViewer(number);
  if (!order) notFound();

  const firstName = order.address.fullName.split(/\s+/)[0];
  const itemCount = order.lines.reduce((n, l) => n + l.quantity, 0);
  const confirmed = order.status === "pending_payment" || order.status === "paid";

  return (
    <Container className={s.page}>
      <section className={s.hero}>
        <span className={s.badge}>
          <Icon name="check" size={28} />
        </span>
        <p className={s.eyebrow}>{confirmed ? "Order confirmed" : STATUS_LABEL[order.status]}</p>
        <h1 className={s.title}>Thank you, {firstName}</h1>
        <p className={s.lead}>
          We&apos;ve sent the details to <strong>{order.email}</strong>.
        </p>
        <div className={s.reference}>
          <span className={s.refLabel}>Order</span>
          <strong className={s.refNumber}>{order.number}</strong>
          <CopyButton value={order.number} label="Copy order number" />
        </div>
      </section>

      <section className={s.card} aria-labelledby="status-title">
        <div className={s.cardHead}>
          <h2 id="status-title" className={s.cardTitle}>
            Order status
          </h2>
          <span className={s.status}>{STATUS_LABEL[order.status]}</span>
        </div>
        <OrderTimeline status={order.status} reachedAt={order.reachedAt} />
      </section>

      <section className={s.card} aria-labelledby="items-title">
        <div className={s.cardHead}>
          <h2 id="items-title" className={s.cardTitle}>
            Your pieces
          </h2>
          <span className={s.count}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        <ul className={s.lines}>
          {order.lines.map((l) => (
            <li key={l.sku} className={s.line}>
              <span className={s.thumb}>
                <Image src={l.image} alt="" fill sizes="72px" />
              </span>
              <span className={s.lineInfo}>
                <span className={s.lineName}>{l.name}</span>
                <span className={s.muted}>
                  {l.variantLabel}
                  {l.quantity > 1 && ` · ×${l.quantity}`}
                </span>
              </span>
              <span className={s.linePrice}>{formatPrice(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className={s.totals}>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
          </div>
          <div className={s.grand}>
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <p className={s.address}>
          <Icon name="truck" size={18} />
          <span>
            {order.address.fullName}, {order.address.street}
            {order.address.apartment && `, ${order.address.apartment}`}, {order.address.city} · {order.address.phone}
          </span>
        </p>
      </section>

      <div className={s.actions}>
        {order.isGuest && (
          <ButtonLink href="/login" variant="secondary" fullWidth>
            Create an account to follow your order
          </ButtonLink>
        )}
        <ButtonLink href="/" fullWidth iconEnd={<Icon name="arrowRight" size={20} />}>
          Continue shopping
        </ButtonLink>
        <p className={s.help}>
          Questions about your order? <Link href="/contact">Contact the atelier</Link>
        </p>
      </div>
    </Container>
  );
}
