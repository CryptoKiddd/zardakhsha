import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chip, Container } from "@/components/ui";
import { WithActionBar } from "@/components/layout";
import { routes } from "@/config/navigation";
import { getProductBySlug } from "@/features/products/queries";
import { ReviewCard } from "@/features/reviews/components/ReviewCard";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { ReviewSummary } from "@/features/reviews/components/ReviewSummary";
import { getReviews, getReviewSummary, type ReviewFilter } from "@/features/reviews/queries";
import s from "./reviews.module.scss";

const FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "photos", label: "With photos" },
  { value: "5", label: "5★" },
  { value: "4", label: "4★" },
  { value: "3", label: "3★" },
];

export async function generateMetadata({ params }: PageProps<"/product/[slug]/reviews">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product ? `Reviews: ${product.name}` : "Reviews" };
}

export default async function ReviewsPage({ params, searchParams }: PageProps<"/product/[slug]/reviews">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const f = (await searchParams).filter;
  const filter = (FILTERS.some((x) => x.value === f) ? f : "all") as ReviewFilter;
  const [summary, reviews] = await Promise.all([getReviewSummary(product.id), getReviews(product.id, filter, 50)]);

  return (
    <WithActionBar>
      <Container className={s.page}>
        <div>
          <h1>Reviews</h1>
          <p className={s.muted}>{product.name}</p>
        </div>

        <ReviewSummary summary={summary} />

        <div className={s.filters}>
          {FILTERS.map((x) => (
            <Chip
              key={x.value}
              href={routes.reviews(slug, x.value === "all" ? undefined : x.value)}
              selected={filter === x.value}
            >
              {x.label}
            </Chip>
          ))}
        </div>

        <div>
          {reviews.length === 0 ? (
            <p className={s.muted}>No reviews match this filter.</p>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>

        <ReviewForm productId={product.id} slug={slug} />
      </Container>
    </WithActionBar>
  );
}
