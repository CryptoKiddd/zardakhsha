import Image from "next/image";
import { Badge, Rating } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { ReviewDTO } from "../queries";
import s from "./Reviews.module.scss";

const FIT = { small: "Runs small", true: "True to size", large: "Runs large" } as const;

export function ReviewCard({ review }: { review: ReviewDTO }) {
  return (
    <article className={s.card}>
      <header className={s.cardHead}>
        <div>
          <p className={s.author}>
            {review.authorName}
            {review.verifiedBuyer && <Badge tone="gold">Verified buyer</Badge>}
          </p>
          <p className={s.muted}>{formatDate(review.createdAt)}</p>
        </div>
        <Rating value={review.rating} />
      </header>
      {(review.variantLabel || review.fit) && (
        <p className={s.muted}>{[review.variantLabel, review.fit && FIT[review.fit]].filter(Boolean).join(" · ")}</p>
      )}
      <p className={s.body}>{review.body}</p>
      {review.photos.length > 0 && (
        <ul className={s.photos}>
          {review.photos.map((src) => (
            <li key={src} className={s.photo}>
              <Image src={src} alt={`Photo from ${review.authorName}`} fill sizes="80px" />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
