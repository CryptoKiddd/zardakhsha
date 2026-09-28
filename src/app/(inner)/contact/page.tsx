import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Contact" };

// TODO: replace with the "Contact" screen from the design.
export default function ContactPage() {
  return (
    <Container>
      <h1 style={{ paddingBlock: "var(--space-5)" }}>Contact</h1>
      <p>Questions about an order or a custom piece? Write to us. Details coming soon.</p>
    </Container>
  );
}
