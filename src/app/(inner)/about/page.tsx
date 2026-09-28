import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "About the Atelier" };

// TODO: replace with the "About" screen from the design.
export default function AboutPage() {
  return (
    <Container>
      <h1 style={{ paddingBlock: "var(--space-5)" }}>About the Atelier</h1>
      <p>Zardakhsha is a Georgian enamel atelier in Tbilisi. Content coming soon.</p>
    </Container>
  );
}
