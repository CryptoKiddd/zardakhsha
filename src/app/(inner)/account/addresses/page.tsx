import type { Metadata } from "next";
import { Badge, Container, Section } from "@/components/ui";
import { AddressForm } from "@/features/account/components/AddressForm";
import s from "@/features/account/components/AccountPage.module.scss";
import { getAddresses, requireUser } from "@/features/account/queries";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await getAddresses(user.id);

  return (
    <Container className={s.page}>
      <h1>Addresses</h1>

      {addresses.length > 0 && (
        <ul className={s.list}>
          {addresses.map((a) => (
            <li key={a.id} className={s.row}>
              <span>
                <strong>{a.fullName}</strong>
                <span className={s.muted}>
                  {a.street}
                  {a.apartment ? `, ${a.apartment}` : ""}, {a.city}
                </span>
                <span className={s.muted}>{a.phone}</span>
              </span>
              {a.isDefault && <Badge tone="gold">Default</Badge>}
            </li>
          ))}
        </ul>
      )}

      <Section title="Add a new address">
        <AddressForm />
      </Section>
    </Container>
  );
}
