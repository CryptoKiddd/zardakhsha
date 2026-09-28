import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink, Container } from "@/components/ui";
import { CATEGORIES, routes } from "@/config/navigation";
import { ListingToolbar, type ListingState } from "@/features/products/components/ListingToolbar";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/products/components/ProductGridSkeleton";
import { getListing } from "@/features/products/queries";
import type { SortKey } from "@/features/products/types";
import s from "./shop.module.scss";

const TITLES: Record<string, string> = {
  ...Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label])),
  new: "New In",
  silver: "Silver Collection",
  gold: "Gold Collection",
  gifts: "Gift Guide",
};

const SORT_KEYS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "rating"];

function parseState(sp: Record<string, string | string[] | undefined>): ListingState {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) as string | undefined;
  const sort = one("sort") as SortKey | undefined;
  const metal = one("metal");
  const max = Number(one("max"));
  return {
    sort: sort && SORT_KEYS.includes(sort) ? sort : undefined,
    metal: metal === "silver" || metal === "gold" ? metal : undefined,
    maxPrice: Number.isFinite(max) && max > 0 ? max * 100 : undefined,
  };
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: TITLES[slug] ?? "Shop" };
}

export default async function ShopPage({ params, searchParams }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  if (!TITLES[slug]) notFound();
  const state = parseState(await searchParams);

  return (
    <Container>
      <div className={s.head}>
        <h1>{TITLES[slug]}</h1>
      </div>
      <ListingToolbar basePath={`/shop/${slug}`} state={state} />
      {/* key: show the skeleton again whenever filters change */}
      <Suspense key={JSON.stringify(state)} fallback={<ProductGridSkeleton count={6} />}>
        <Results slug={slug} state={state} />
      </Suspense>
    </Container>
  );
}

async function Results({ slug, state }: { slug: string; state: ListingState }) {
  const result = await getListing({ slug, ...state });
  if (!result) notFound();

  if (result.products.length === 0) {
    return (
      <div className={s.empty}>
        <p>Nothing matches these filters yet.</p>
        <ButtonLink href={routes.shop(slug)} variant="secondary">
          Clear filters
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      <p className={s.count}>{result.total} pieces</p>
      <ProductGrid
        products={result.products}
        insert={
          <aside className={s.editorial}>
            <p className={s.editorialEyebrow}>Handmade in Tbilisi</p>
            <p className={s.editorialTitle}>Every piece is fired by hand, so each one is unique.</p>
          </aside>
        }
      />
    </>
  );
}
