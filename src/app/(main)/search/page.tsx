import type { Metadata } from "next";
import Form from "next/form";
import { Suspense } from "react";
import { Chip, Container, Icon } from "@/components/ui";
import { routes } from "@/config/navigation";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/products/components/ProductGridSkeleton";
import { searchProducts } from "@/features/products/queries";
import s from "./search.module.scss";

export const metadata: Metadata = { title: "Search" };

const TRENDING = ["Cobalt ring", "Gold earrings", "Pendant", "Gift"];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  return (
    <Container>
      <h1 className="visually-hidden">Search</h1>
      {/* next/form: client-side navigation to /search?q=… with prefetching, and works without JS */}
      <Form action="/search" className={s.form}>
        <Icon name="search" size={20} className={s.icon} />
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search rings, earrings, colors…"
          aria-label="Search products"
          autoFocus={!q}
          className={s.input}
        />
      </Form>

      {!q ? (
        <section className={s.trending}>
          <h2 className={s.label}>Trending</h2>
          <div className={s.chips}>
            {TRENDING.map((t) => (
              <Chip key={t} href={routes.search(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </section>
      ) : (
        <Suspense key={q} fallback={<ProductGridSkeleton count={4} />}>
          <Results q={q} />
        </Suspense>
      )}
    </Container>
  );
}

async function Results({ q }: { q: string }) {
  const products = await searchProducts(q);
  return (
    <section className={s.results}>
      <p className={s.label} role="status">
        {products.length} results for &ldquo;{q}&rdquo;
      </p>
      {products.length > 0 && <ProductGrid products={products} />}
    </section>
  );
}
