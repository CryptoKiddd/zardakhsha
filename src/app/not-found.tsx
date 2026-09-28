import { Footer } from "@/components/layout";
import { Header } from "@/components/layout/Header/Header";
import { ButtonLink, Container } from "@/components/ui";

// Root 404 renders outside the route groups, so it brings its own Header A.
export default function NotFound() {
  return (
    <>
      <Header variant="a" />
      <main id="main">
        <Container>
          <div
            style={{
              display: "grid",
              justifyItems: "center",
              gap: "var(--space-4)",
              paddingBlock: "var(--space-8)",
              textAlign: "center",
            }}
          >
            <h1>This page wandered off</h1>
            <p style={{ color: "var(--color-muted)" }}>The piece you&apos;re looking for may have sold out or moved.</p>
            <ButtonLink href="/shop/new">Browse New In</ButtonLink>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
