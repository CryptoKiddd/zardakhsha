import Link from "next/link";
import { Icon } from "@/components/ui";
import { routes } from "@/config/navigation";
import type { TestimonialDTO } from "../queries";
import s from "./ReviewQuote.module.scss";

/** Compact testimonial for Home: initials, name, verified mark, the piece they bought, and the quote. */
export function ReviewQuote({ review }: { review: TestimonialDTO }) {
  const initials = review.authorName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <figure className={s.card}>
      <figcaption className={s.head}>
        <span className={s.avatar} aria-hidden>
          {initials}
        </span>
        <span className={s.who}>
          <span className={s.name}>
            {review.authorName}
            {review.verifiedBuyer && <Icon name="check" size={16} label="Verified buyer" className={s.verified} />}
          </span>
          {review.product && (
            <span className={s.meta}>
              Bought{" "}
              <Link href={routes.product(review.product.slug)} className={s.product}>
                {review.product.name}
              </Link>
            </span>
          )}
        </span>
      </figcaption>
      <blockquote className={s.quote}>
        <p>&ldquo;{review.body}&rdquo;</p>
      </blockquote>
    </figure>
  );
}
