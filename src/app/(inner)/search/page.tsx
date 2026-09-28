import type { Metadata } from "next";
import { Suspense, ViewTransition } from "react";
import { Chip, Container, Icon } from "@/components/ui";
import { CATEGORIES, routes, type CategorySlug } from "@/config/navigation";
import { CategoryTiles } from "@/features/products/components/CategoryTiles";
import { RecentSearches } from "@/features/products/components/RecentSearches";
import { SearchBox } from "@/features/products/components/SearchBox";
import { SearchResultList, SearchResultsSkeleton } from "@/features/products/components/SearchResults";
import { getCategoryCounts, searchProducts } from "@/features/products/queries";
import s from "./search.module.scss";

export const metadata: Metadata = { title: "Search" };

const TRENDING = ["Cobalt ring", "Gold earrings", "Pomegranate", "Pendant", "Gift"];

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = first(params.q);
  const rawCategory = first(params.category);
  const category = CATEGORIES.find((c) => c.slug === rawCategory)?.slug;

  return (
    // Opens like the carousel's iris (styles/base/_view-transitions.scss). Must live in the page, not the
    // layout: layouts persist across navigations, so enter would never fire there. Closing is `data-exit`,
    // played by the header's BackButton before it navigates.
    <ViewTransition enter="search-open" default="none">
      <Container className={s.page} data-exit="iris">
        <h1 className="visually-hidden">Search</h1>
        <SearchBox defaultValue={q} category={category} />

        {q && (
          <nav aria-label="Filter by category">
            <ul className={s.categories}>
              <li>
                <Chip href={routes.search(q)} selected={!category}>
                  All
                </Chip>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Chip href={routes.search(q, c.slug)} selected={category === c.slug}>
                    {c.label}
                  </Chip>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {q && (
          // key: show the skeleton again whenever the query or filter changes.
          <Suspense key={`${q}|${category ?? ""}`} fallback={<ResultsFrame q={q} count={null} />}>
            <Results q={q} category={category} />
          </Suspense>
        )}

        <RecentSearches className={s.block} />

        <section className={s.block} aria-labelledby="trending-title">
          <h2 id="trending-title" className={s.title}>
            <Icon name="trend" size={20} className={s.titleIcon} />
            Trending Searches
          </h2>
          <ul className={s.trending}>
            {TRENDING.map((t) => (
              <li key={t}>
                <Chip href={routes.search(t)}>{t}</Chip>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.block} aria-labelledby="explore-title">
          <h2 id="explore-title" className={s.title}>
            Explore by Category
          </h2>
          <Suspense fallback={<CategoryTiles counts={null} />}>
            <ExploreCategories />
          </Suspense>
        </section>

        <aside className={s.authenticity}>
          <span className={s.authIcon}>
            <Icon name="shield" />
          </span>
          <div>
            <p className={s.authTitle}>Minankari authenticity</p>
            <p className={s.authText}>
              Every piece is hallmarked 925 silver and handmade in our Tbilisi atelier, with 30-day returns.
            </p>
          </div>
        </aside>
      </Container>
    </ViewTransition>
  );
}

async function Results({ q, category }: { q: string; category?: CategorySlug }) {
  const products = await searchProducts(q, { category });
  return (
    <ViewTransition enter="results-in" default="none">
      <ResultsFrame q={q} count={products.length}>
        {products.length > 0 ? (
          <SearchResultList products={products} />
        ) : (
          <p className={s.empty}>
            No pieces match &ldquo;{q}&rdquo;{category ? " in this category" : ""}. Try a trending search or browse a
            category below.
          </p>
        )}
      </ResultsFrame>
    </ViewTransition>
  );
}

/** Heading row + results. `count` is null while loading (renders the skeleton). */
function ResultsFrame({ q, count, children }: { q: string; count: number | null; children?: React.ReactNode }) {
  return (
    <section className={s.results} aria-labelledby="results-title">
      <div className={s.resultsHead}>
        <h2 id="results-title" className={s.title}>
          Live Matches
          <span className={s.count} role="status">
            {count == null ? "…" : `${count} ${count === 1 ? "piece" : "pieces"}`}
          </span>
        </h2>
        <p className={s.query}>Query: &ldquo;{q}&rdquo;</p>
      </div>
      {count == null ? <SearchResultsSkeleton /> : children}
    </section>
  );
}

async function ExploreCategories() {
  const counts = await getCategoryCounts();
  return <CategoryTiles counts={counts} />;
}
