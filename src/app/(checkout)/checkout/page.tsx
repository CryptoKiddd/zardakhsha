import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { WithActionBar } from "@/components/layout";
import { GoogleSignInButton } from "@/features/account/components/AuthButtons";
import { getAddresses } from "@/features/account/queries";
import { getCart } from "@/features/cart/queries";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { OrderSummary, shippingFor } from "@/features/checkout/components/OrderSummary";
import { getSession } from "@/lib/auth";
import s from "./checkout.module.scss";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [cart, session] = await Promise.all([getCart(), getSession()]);
  if (cart.lines.length === 0) redirect("/bag");

  const addresses = session ? await getAddresses(session.user.id) : [];
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  return (
    <WithActionBar>
      <Container className={s.page}>
        <h1>Checkout</h1>
        <OrderSummary subtotal={cart.subtotal} count={cart.count} collapsible />
        {!session && (
          <div className={s.signin}>
            <GoogleSignInButton callbackURL="/checkout" />
            <p className={s.muted}>or continue as a guest below</p>
          </div>
        )}
        <CheckoutForm
          email={session?.user.email}
          defaultAddress={defaultAddress}
          total={cart.subtotal + shippingFor(cart.subtotal)}
        />
      </Container>
    </WithActionBar>
  );
}
