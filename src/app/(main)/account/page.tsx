import type { Metadata } from "next";
import Link from "next/link";
import { Container, Icon, type IconName } from "@/components/ui";
import { SignOutButton } from "@/features/account/components/AuthButtons";
import { requireUser } from "@/features/account/queries";
import s from "@/features/account/components/AccountPage.module.scss";

export const metadata: Metadata = { title: "My account" };

const CARDS: {
  href: "/account/orders" | "/account/addresses" | "/bag";
  icon: IconName;
  title: string;
  text: string;
}[] = [
  { href: "/account/orders", icon: "truck", title: "Orders", text: "Track and view past orders" },
  { href: "/account/addresses", icon: "user", title: "Addresses", text: "Delivery name, phone and address" },
  { href: "/bag", icon: "bag", title: "Bag", text: "Continue where you left off" },
];

export default async function AccountPage() {
  const user = await requireUser("/account");

  return (
    <Container className={s.page}>
      <h1>Hi, {user.name.split(" ")[0]}</h1>
      <p className={s.muted}>{user.email}</p>

      <ul className={s.cards}>
        {CARDS.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className={s.card}>
              <Icon name={c.icon} />
              <span>
                <strong>{c.title}</strong>
                <span className={s.muted}>{c.text}</span>
              </span>
              <Icon name="chevronRight" size={20} className={s.chevron} />
            </Link>
          </li>
        ))}
      </ul>

      <SignOutButton />
    </Container>
  );
}
