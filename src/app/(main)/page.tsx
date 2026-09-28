import Image from "next/image";
import { Suspense } from "react";
import { ButtonLink, Container, Icon, Rating, Section, type IconName } from "@/components/ui";
import { routes } from "@/config/navigation";
import { BentoGrid } from "@/features/products/components/BentoGrid";
import { CategoryChips } from "@/features/products/components/CategoryChips";
import { ProductCarousel } from "@/features/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/products/components/ProductGridSkeleton";
import { getFeatured } from "@/features/products/queries";
import s from "./home.module.scss";

const TRUST: { icon: IconName; label: string }[] = [
  { icon: "sparkle", label: "Handmade in Georgia" },
  { icon: "shield", label: "925 Sterling Silver" },
  { icon: "lock", label: "Secure payment" },
  { icon: "returns", label: "30-day returns" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className={s.hero}>
        <Image
          src="/images/placeholder/hero.svg"
          alt="Enamel rings on a hand"
          fill
          priority
          sizes="100vw"
          className={s.heroImage}
        />
        <div className={s.heroContent}>
          <p className={s.eyebrow}>New collection</p>
          <h1 className={s.heroTitle}>Color, fired by hand</h1>
          <p className={s.heroText}>Georgian enamel set in sterling silver and gold.</p>
          <ButtonLink href={routes.shop("new")} size="lg">
            Shop New Collection
          </ButtonLink>
        </div>
      </section>

      <Container>
        <CategoryChips />

        <Section title="Featured" eyebrow="Curated">
          <BentoGrid
            tiles={[
              {
                title: "The Wave Collection",
                subtitle: "Cobalt enamel, silver waves",
                href: routes.shop("rings"),
                image: { url: "/images/placeholder/cobalt-silver.svg", alt: "Cobalt wave ring" },
              },
              {
                title: "Earrings",
                href: routes.shop("earrings"),
                image: { url: "/images/placeholder/turquoise-gold.svg", alt: "Turquoise earrings" },
              },
              {
                title: "Gifts",
                href: routes.shop("gifts"),
                image: { url: "/images/placeholder/ruby-silver.svg", alt: "Ruby pendant gift" },
              },
            ]}
          />
        </Section>

        {/* Streams in; the rest of the page renders instantly. */}
        <Section title="Bestsellers" action={{ label: "View all", href: routes.shop("new") }}>
          <Suspense fallback={<ProductGridSkeleton carousel />}>
            <Bestsellers />
          </Suspense>
        </Section>

        <Section className={s.story}>
          <div className={s.storyGrid}>
            <div className={s.storyImage}>
              <Image
                src="/images/placeholder/emerald-gold.svg"
                alt="Enamel being fired in the atelier kiln"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div className={s.storyText}>
              <p className={s.eyebrow}>The craft</p>
              <h2>Enamel + silver, a new Georgian craft</h2>
              <p>
                Every piece is shaped in silver, filled with glass enamel and fired by hand in our Tbilisi atelier. No
                two are exactly alike.
              </p>
              <ButtonLink href="/about" variant="secondary">
                Our story
              </ButtonLink>
            </div>
          </div>
        </Section>

        <Section title="Loved by 1,200+ customers">
          <div className={s.proof}>
            <Rating value={4.9} count={1200} size={18} />
          </div>
        </Section>

        <ul className={s.trust}>
          {TRUST.map((t) => (
            <li key={t.label}>
              <Icon name={t.icon} />
              {t.label}
            </li>
          ))}
        </ul>

        <Section className={s.newsletter}>
          <h2>Get 10% off your first order</h2>
          <p>New collections and atelier stories, once a month.</p>
          {/* TODO: wire to a subscribe Server Action + email provider */}
          <form className={s.newsletterForm}>
            <label className="visually-hidden" htmlFor="nl-email">
              Email
            </label>
            <input id="nl-email" type="email" name="email" placeholder="Your email" autoComplete="email" required />
            <button type="submit">Subscribe</button>
          </form>
        </Section>
      </Container>
    </>
  );
}

async function Bestsellers() {
  const products = await getFeatured(8);
  return <ProductCarousel products={products} label="Bestsellers" />;
}
