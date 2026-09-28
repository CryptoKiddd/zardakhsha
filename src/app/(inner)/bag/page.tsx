import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";
import { StickyActionBar, WithActionBar } from "@/components/layout";
import { CartLines } from "@/features/cart/components/CartLines";
import { FreeShippingProgress } from "@/features/cart/components/FreeShippingProgress";
import { getCart } from "@/features/cart/queries";
import { OrderSummary, shippingFor } from "@/features/checkout/components/OrderSummary";
import { formatPrice } from "@/lib/format";
import s from "./bag.module.scss";

export const metadata: Metadata = { title: "Your bag" };

export default async function BagPage() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <Container className={s.empty}>
        <h1>Your bag is empty</h1>
        <p>Find something handmade you love.</p>
        <ButtonLink href="/shop/new">Shop New In</ButtonLink>
      </Container>
    );
  }

  const total = cart.subtotal + shippingFor(cart.subtotal);

  return (
    <WithActionBar>
      <Container className={s.page}>
        <h1>Your bag</h1>
        <FreeShippingProgress subtotal={cart.subtotal} />
        <CartLines lines={cart.lines} />
        <OrderSummary subtotal={cart.subtotal} count={cart.count} />
      </Container>
      <StickyActionBar>
        <ButtonLink href="/checkout" fullWidth>
          Checkout · {formatPrice(total)}
        </ButtonLink>
      </StickyActionBar>
    </WithActionBar>
  );
}
