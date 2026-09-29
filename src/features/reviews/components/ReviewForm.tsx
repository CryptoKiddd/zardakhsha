"use client";

import { useActionState, useState } from "react";
import { Button, Icon, Sheet, toast } from "@/components/ui";
import { StickyActionBar } from "@/components/layout";
import { createReview, type ReviewFormState } from "../actions";
import s from "./Reviews.module.scss";

/** "Write a review" button + bottom sheet form. Validation errors come back from the Server Action. */
export function ReviewForm({ productId, slug }: { productId: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(
    async (prev, fd) => {
      const res = await createReview(prev, fd);
      if (res.ok) {
        setOpen(false);
        toast.success("Review posted", { id: "review", description: "Thank you, it's live now." });
      }
      return res;
    },
    { ok: false },
  );

  return (
    <>
      <StickyActionBar>
        <Button fullWidth variant="secondary" onClick={() => setOpen(true)}>
          Write a review
        </Button>
      </StickyActionBar>

      <Sheet open={open} onClose={() => setOpen(false)} title="Write a review">
        {state.ok ? (
          <p className={s.success}>{state.message}</p>
        ) : (
          <form action={action} className={s.form}>
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="rating" value={rating || ""} />

            <fieldset className={s.starPicker}>
              <legend className={s.label}>Your rating</legend>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                >
                  <Icon name="star" size={32} filled={n <= rating} />
                </button>
              ))}
              {state.errors?.rating && <p className={s.error}>{state.errors.rating}</p>}
            </fieldset>

            <label className={s.label}>
              How does it fit?
              <select name="fit" className={s.select} defaultValue="">
                <option value="">Not applicable</option>
                <option value="small">Runs small</option>
                <option value="true">True to size</option>
                <option value="large">Runs large</option>
              </select>
            </label>

            <label className={s.label}>
              Your review
              <textarea name="body" rows={5} className={s.textarea} aria-invalid={!!state.errors?.body} />
              {state.errors?.body && <span className={s.error}>{state.errors.body}</span>}
            </label>

            {state.message && <p className={s.error}>{state.message}</p>}
            <Button type="submit" fullWidth loading={pending}>
              Submit review
            </Button>
          </form>
        )}
      </Sheet>
    </>
  );
}
