import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink, Container, Icon, Rating, Section, type IconName } from "@/components/ui";
import { routes } from "@/config/navigation";
import { CategoryChips } from "@/features/products/components/CategoryChips";
import { FeaturedWorks, FeaturedWorksSkeleton } from "@/features/products/components/FeaturedWorks";
import { ProductCarousel } from "@/features/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/products/components/ProductGridSkeleton";
import { getFeatured, getFeaturedWorks } from "@/features/products/queries";
import { ReviewQuote } from "@/features/reviews/components/ReviewQuote";
import { getHomeReviews, getStoreRating } from "@/features/reviews/queries";
import s from "./home.module.scss";

const TRUST: { icon: IconName; title: string; text: string }[] = [
  { icon: "sparkle", title: "Minankari", text: "Handcrafted in Tbilisi" },
  { icon: "shield", title: "925 Silver", text: "Hallmarked authenticity" },
  { icon: "lock", title: "Secure checkout", text: "Encrypted card payment" },
  { icon: "returns", title: "30-Day Returns", text: "Atelier guarantee" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className={s.hero}>
        <Image
          src="/images/home/hero.jpg"
          alt="A hand wearing cloisonné enamel rings in silver and gold"
          fill
          priority
          sizes="100vw"
          className={s.heroImage}
        />
        <div className={s.heroContent}>
          <p className={s.heroEyebrow}>Haute Vitreous Jewelry · Tbilisi</p>
          <h1 className={s.heroTitle}>Color, fired by hand.</h1>
          <p className={s.heroText}>Handcrafted 925 sterling silver &amp; pure vitreous kiln-fused enamel heirlooms.</p>
          <ButtonLink
            href={routes.shop("new")}
            size="lg"
            fullWidth
            iconEnd={<Icon name="arrowRight" size={20} />}
            className={s.heroCta}
          >
            Shop New Collection
          </ButtonLink>
        </div>
      </section>

      <Container>
        <CategoryChips />

        {/* Each block streams in; the heading renders with the skeleton and the whole section hides if empty. */}
        <Suspense
          fallback={
            <FeaturedSection>
              <FeaturedWorksSkeleton />
            </FeaturedSection>
          }
        >
          <Featured />
        </Suspense>

        <Suspense
          fallback={
            <BestsellersSection>
              <ProductGridSkeleton carousel />
            </BestsellersSection>
          }
        >
          <Bestsellers />
        </Suspense>

        <section className={s.story}>
          <div className={s.storyImage}>
            <Image
              src="/images/home/craft.jpg"
              alt="An artisan's hands laying silver wire and enamel powder in the Tbilisi atelier"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <span className={s.storyChip}>
              <Icon name="flame" size={16} />
              800°C kiln fused
            </span>
          </div>
          <div className={s.storyText}>
            <p className={s.eyebrow}>Minankari Heritage</p>
            <h2 className={s.storyTitle}>Enamel + Silver, an eternal craft</h2>
            <p className={s.storyBody}>
              Every piece undergoes 5 to 7 firings at 800°C. Pure 925 silver partition wires cradle crushed mineral
              glass powders, fusing into luminous color that never fades.
            </p>
            <Link href="/about" className={s.textLink}>
              Discover the Atelier Technique <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </section>

        <Suspense fallback={<div className={s.proofSkeleton} aria-busy="true" />}>
          <SocialProof />
        </Suspense>

        <ul className={s.trust}>
          {TRUST.map((t) => (
            <li key={t.title}>
              <span className={s.trustIcon}>
                <Icon name={t.icon} size={20} />
              </span>
              <span>
                <span className={s.trustTitle}>{t.title}</span>
                <span className={s.trustText}>{t.text}</span>
              </span>
            </li>
          ))}
        </ul>

        <section className={s.newsletter}>
          <span className={s.newsletterIcon}>
            <Icon name="mail" />
          </span>
          <h2 className={s.newsletterTitle}>Join the Atelier Gazette</h2>
          <p>Receive 10% off your first heirloom order and private invitations to limited kiln releases.</p>
          {/* TODO: wire to a subscribe Server Action + email provider */}
          <form className={s.newsletterForm}>
            <label className="visually-hidden" htmlFor="nl-email">
              Email
            </label>
            <input
              id="nl-email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />
            <button type="submit">Claim 10% Off</button>
          </form>
        </section>
      </Container>
    </>
  );
}

function FeaturedSection({ children }: { children: React.ReactNode }) {
  return (
    <Section
      title="Featured Works"
      eyebrow="Curated Masterpieces"
      action={{ label: "Browse all", href: routes.shop("new") }}
    >
      {children}
    </Section>
  );
}

function BestsellersSection({ children }: { children: React.ReactNode }) {
  return (
    <Section
      title="Bestsellers"
      eyebrow="Treasured by Patrons"
      action={{ label: "View all", href: routes.shop("new") }}
    >
      {children}
    </Section>
  );
}

async function Featured() {
  const products = await getFeaturedWorks(3);
  if (products.length === 0) return null;
  return (
    <FeaturedSection>
      <FeaturedWorks products={products} />
    </FeaturedSection>
  );
}

async function Bestsellers() {
  const products = await getFeatured(8);
  if (products.length === 0) return null;
  return (
    <BestsellersSection>
      <ProductCarousel products={products} label="Bestsellers" />
    </BestsellersSection>
  );
}

async function SocialProof() {
  const [rating, reviews] = await Promise.all([getStoreRating(), getHomeReviews(2)]);
  if (rating.count === 0) return null;

  return (
    <section className={s.proof} aria-labelledby="proof-title">
      <div className={s.proofHead}>
        <Rating value={rating.average} size={24} />
        <h2 id="proof-title" className={s.proofTitle}>
          {rating.average.toFixed(1)} from {rating.count.toLocaleString("en")} reviews
        </h2>
        <p className={s.proofText}>Handcrafted in Georgia, collected worldwide.</p>
      </div>
      {reviews.length > 0 && (
        <ul className={s.quotes}>
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewQuote review={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
