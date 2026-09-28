import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink, Container, Icon, Section } from "@/components/ui";
import { StickyActionBar, WithActionBar } from "@/components/layout";
import { routes } from "@/config/navigation";
import { FREE_SHIPPING_THRESHOLD } from "@/config/shop";
import { CartLines } from "@/features/cart/components/CartLines";
import { FreeShippingProgress } from "@/features/cart/components/FreeShippingProgress";
import { getCart } from "@/features/cart/queries";
import { OrderSummary, shippingFor } from "@/features/checkout/components/OrderSummary";
import { ProductCarousel } from "@/features/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/products/components/ProductGridSkeleton";
import { getComplements } from "@/features/products/queries";
import { formatPrice } from "@/lib/format";
import s from "./bag.module.scss";

export const metadata: Metadata = { title: "Your bag" };

export default async function BagPage() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <Container className={s.page}>
        <div className={s.empty}>
          <span className={s.emptyIcon}>
            <Icon name="bag" size={28} />
          </span>
          <h1 className={s.title}>Your bag is empty</h1>
          <p>Find something handmade you love. Delivery is free over {formatPrice(FREE_SHIPPING_THRESHOLD)}.</p>
          <ButtonLink href={routes.shop("new")} iconEnd={<Icon name="arrowRight" size={20} />}>
            Shop New In
          </ButtonLink>
        </div>
        <Suspense fallback={<ComplementsSkeleton title="Bestsellers to start with" />}>
          <Complements exclude={[]} title="Bestsellers to start with" />
        </Suspense>
      </Container>
    );
  }

  const total = cart.subtotal + shippingFor(cart.subtotal);

  return (
    <WithActionBar>
      <Container className={s.page}>
        <h1 className={s.title}>
          Your bag <span className={s.count}>({cart.count})</span>
        </h1>
        <FreeShippingProgress subtotal={cart.subtotal} />
        <CartLines lines={cart.lines} />
        <OrderSummary subtotal={cart.subtotal} count={cart.count} />
        <ul className={s.trust}>
          <li>
            <Icon name="lock" size={16} /> Secure checkout
          </li>
          <li>
            <Icon name="shield" size={16} /> Hallmarked 925
          </li>
          <li>
            <Icon name="returns" size={16} /> 30-day returns
          </li>
        </ul>
        <Suspense fallback={<ComplementsSkeleton title="Pairs well with" />}>
          <Complements exclude={cart.lines.map((l) => l.productId)} title="Pairs well with" />
        </Suspense>
      </Container>
      <StickyActionBar>
        <p className={s.barTotal}>
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </p>
        <ButtonLink href="/checkout" className={s.barCta} iconEnd={<Icon name="arrowRight" size={20} />}>
          Checkout
        </ButtonLink>
      </StickyActionBar>
    </WithActionBar>
  );
}

async function Complements({ exclude, title }: { exclude: string[]; title: string }) {
  const products = await getComplements(exclude);
  if (products.length === 0) return null;
  return (
    <Section title={title} className={s.complements}>
      <ProductCarousel products={products} label={title} />
    </Section>
  );
}

function ComplementsSkeleton({ title }: { title: string }) {
  return (
    <Section title={title} className={s.complements}>
      <ProductGridSkeleton carousel />
    </Section>
  );
}
