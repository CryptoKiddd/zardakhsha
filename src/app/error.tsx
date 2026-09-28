"use client";

import { useEffect } from "react";
import { Button, Container } from "@/components/ui";

/** Catches render/data errors below the root layout. Header stays visible (it's in the group layouts). */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
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
        <h1>Something went wrong</h1>
        <p style={{ color: "var(--color-muted)" }}>Please try again in a moment.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </Container>
  );
}
