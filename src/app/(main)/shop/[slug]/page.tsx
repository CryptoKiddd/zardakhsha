import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense, ViewTransition } from "react";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { CATEGORIES } from "@/config/navigation";
import { CategoryTabs } from "@/features/products/components/CategoryTabs";
import { FilterBar } from "@/features/products/components/FilterBar";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/products/components/ProductGridSkeleton";
import { SortSelect } from "@/features/products/components/SortSelect";
import { activeFilters, listingHref, parseListingState, type ListingState } from "@/features/products/listing";
import { getListing } from "@/features/products/queries";
import s from "./shop.module.scss";

const PAGES: Record<string, { title: string; subtitle: string }> = {
  new: { title: "All Pieces", subtitle: "Every piece in the atelier, newest first." },
  rings: { title: "Rings", subtitle: "Cloisonné enamel set in sterling silver or gold." },
  earrings: { title: "Earrings", subtitle: "Drops, studs and hoops, light enough for every day." },
  bracelets: { title: "Bracelets", subtitle: "Cuffs and bangles fired with Georgian enamel." },
  pendants: { title: "Pendants", subtitle: "Miniature enamel paintings on a silver chain." },
  silver: { title: "Silver Collection", subtitle: "Every piece in hallmarked 925 sterling silver." },
  gold: { title: "Gold Collection", subtitle: "Every piece in warm gold." },
  gifts: { title: "Gift Guide", subtitle: "Pieces people remember, packed by hand in Tbilisi." },
};
const CATEGORY_SLUGS = new Set<string>(["new", ...CATEGORIES.map((c) => c.slug)]);

// The count and the grid both need the listing; cache() runs the query once per request.
const listing = cache((slug: string, sort?: string, metal?: string, price?: string, show?: string) =>
  getListing({ slug, ...({ sort, metal, price, show } as ListingState) }),
);
const load = (slug: string, st: ListingState) => listing(slug, st.sort, st.metal, st.price, st.show);

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: PAGES[slug]?.title ?? "Shop" };
}

export default async function ShopPage({ params, searchParams }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  const state = parseListingState(await searchParams);
  const basePath = `/shop/${slug}`;

  return (
    <Container className={s.page}>
      <header className={s.head}>
        <h1 className={s.title}>{page.title}</h1>
        <p className={s.subtitle}>{page.subtitle}</p>
      </header>

      {CATEGORY_SLUGS.has(slug) && <CategoryTabs current={slug} state={state} />}
      <FilterBar basePath={basePath} state={state} />

      <div className={s.meta}>
        <Suspense key={`${slug}${JSON.stringify(state)}`} fallback={<p className={s.count}>&nbsp;</p>}>
          <Count slug={slug} state={state} />
        </Suspense>
        <SortSelect value={state.sort ?? "featured"} />
      </div>

      {/* key: show the skeleton again whenever the category or filters change */}
      <Suspense key={`${slug}${JSON.stringify(state)}`} fallback={<ProductGridSkeleton count={6} />}>
        <Results slug={slug} state={state} basePath={basePath} />
      </Suspense>
    </Container>
  );
}

async function Count({ slug, state }: { slug: string; state: ListingState }) {
  const result = await load(slug, state);
  const n = result?.total ?? 0;
  return (
    <p className={s.count} role="status">
      {n} {n === 1 ? "piece" : "pieces"}
    </p>
  );
}

async function Results({ slug, state, basePath }: { slug: string; state: ListingState; basePath: string }) {
  const result = await load(slug, state);
  if (!result) notFound();

  if (result.products.length === 0) {
    const filtered = activeFilters(state).length > 0;
    return (
      <div className={s.empty}>
        <p className={s.emptyTitle}>Nothing matches {filtered ? "these filters" : "here"} yet</p>
        <p>{filtered ? "Try removing a filter, or look in another category." : "New pieces are on their way."}</p>
        {filtered && (
          <ButtonLink href={listingHref(basePath, { sort: state.sort })} variant="secondary">
            Clear filters
          </ButtonLink>
        )}
      </div>
    );
  }

  return (
    // Results rise in whenever the category or filters change (styles/base/_view-transitions.scss).
    <ViewTransition enter="results-in" default="none">
      <div>
        <ProductGrid products={result.products} insert={<CraftCard />} />
      </div>
    </ViewTransition>
  );
}

/** Editorial break in the grid (from the design): the craft story, one tap from any listing. */
function CraftCard() {
  return (
    <Link href="/about" className={s.craft}>
      <Image src="/images/home/slide-kiln.jpg" alt="" fill sizes="(min-width: 1024px) 100vw, 100vw" />
      <span className={s.craftText}>
        <span className={s.craftEyebrow}>800°C Heritage</span>
        <span className={s.craftQuote}>
          Thin silver walls, filled with mineral glass and fired until the color is permanent.
        </span>
        <span className={s.craftLink}>
          Discover the craft <Icon name="arrowRight" size={18} />
        </span>
      </span>
    </Link>
  );
}
