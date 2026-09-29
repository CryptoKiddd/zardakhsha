import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, Icon } from "@/components/ui";
import { isPlaceholderEmail } from "@/config/auth";
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
        <h1 className={s.title}>Checkout</h1>
        <OrderSummary subtotal={cart.subtotal} count={cart.count} collapsible />
        {!session && (
          <div className={s.signin}>
            <p className={s.muted}>Have an account? Sign in to use your saved address.</p>
            <GoogleSignInButton callbackURL="/checkout" />
            <p className={s.muted}>or continue as a guest below</p>
          </div>
        )}
        <CheckoutForm
          // Phone sign-ups have a placeholder address that can't receive mail: ask for a real one.
          email={isPlaceholderEmail(session?.user.email) ? undefined : session?.user.email}
          phone={session?.user.phoneNumber ?? undefined}
          defaultAddress={defaultAddress}
          total={cart.subtotal + shippingFor(cart.subtotal)}
          freeDelivery={shippingFor(cart.subtotal) === 0}
        />
        <p className={s.guarantee}>
          <Icon name="shield" size={18} />
          Handmade in Tbilisi · Hallmarked 925 silver · Free 30-day returns
        </p>
      </Container>
    </WithActionBar>
  );
}
