import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Accordion, Container, Icon, Rating, Section } from "@/components/ui";
import { WithActionBar } from "@/components/layout";
import { routes } from "@/config/navigation";
import { ProductCarousel } from "@/features/products/components/ProductGrid";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ProductGridSkeleton } from "@/features/products/components/ProductGridSkeleton";
import { ProductPurchase } from "@/features/products/components/ProductPurchase";
import { getCompleteTheLook, getProductBySlug, getRelated } from "@/features/products/queries";
import type { ProductDetailDTO } from "@/features/products/types";
import { ReviewCard } from "@/features/reviews/components/ReviewCard";
import { ReviewSummary } from "@/features/reviews/components/ReviewSummary";
import { getReviews, getReviewSummary } from "@/features/reviews/queries";
import s from "./product.module.scss";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: { images: [product.image.url] },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <WithActionBar>
      <Container>
        <div className={s.layout}>
          <ProductGallery images={product.images} />

          <div className={s.info}>
            <div className={s.titleBlock}>
              <h1 className={s.title}>{product.name}</h1>
              {product.rating.count > 0 && (
                <Link href={routes.reviews(slug)} className={s.ratingLink}>
                  <Rating value={product.rating.average} count={product.rating.count} />
                </Link>
              )}
            </div>

            <ProductPurchase product={product} />

            <p className={s.delivery}>
              <Icon name="truck" size={20} /> Free delivery over ₾150 · Ships in 1–2 business days
            </p>

            <Accordion
              items={[
                { title: "Description", content: <p>{product.description}</p> },
                {
                  title: "Materials & Care",
                  content: (
                    <p>
                      {product.materials} {product.care}
                    </p>
                  ),
                },
                {
                  title: "Shipping & Returns",
                  content: <p>Delivery across Georgia in 1–3 days. Free returns within 30 days.</p>,
                },
              ]}
            />
          </div>
        </div>

        <Suspense fallback={null}>
          <CompleteTheLook product={product} />
        </Suspense>

        <Section title="Reviews" action={{ label: "See all reviews", href: routes.reviews(slug) }}>
          <Suspense fallback={<p>Loading reviews…</p>}>
            <ReviewsPreview productId={product.id} />
          </Suspense>
        </Section>

        <Section title="You may also like">
          <Suspense fallback={<ProductGridSkeleton carousel />}>
            <Related product={product} />
          </Suspense>
        </Section>
      </Container>
    </WithActionBar>
  );
}

// Independent async sections stream in parallel; the purchase area never waits on them.

async function CompleteTheLook({ product }: { product: ProductDetailDTO }) {
  const items = await getCompleteTheLook(product);
  if (items.length === 0) return null;
  return (
    <Section title="Complete the look" eyebrow="Wear it as a set">
      <ProductCarousel products={items} label="Complete the look" />
    </Section>
  );
}

async function ReviewsPreview({ productId }: { productId: string }) {
  const [summary, reviews] = await Promise.all([getReviewSummary(productId), getReviews(productId, "all", 2)]);
  if (summary.count === 0) return <p className={s.muted}>No reviews yet. Be the first to share yours.</p>;
  return (
    <>
      <ReviewSummary summary={summary} />
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </>
  );
}

async function Related({ product }: { product: ProductDetailDTO }) {
  const items = await getRelated(product);
  return <ProductCarousel products={items} label="You may also like" />;
}
