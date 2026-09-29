"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { setWishlisted } from "../actions";
import s from "./WishlistButton.module.scss";

/**
 * Heart toggle. useOptimistic fills it instantly; the Server Action confirms (or it snaps back).
 * Guests are sent to sign-in and returned to the same page afterwards.
 * `overlay`: frosted square on a product photo. `bar`: plain, in the product page's action bar.
 */
export function WishlistButton({
  productId,
  productName,
  initialSaved,
  variant = "overlay",
  className,
}: {
  productId: string;
  productName: string;
  initialSaved: boolean;
  variant?: "overlay" | "bar";
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !optimistic;
    startTransition(async () => {
      setOptimistic(next);
      const res = await setWishlisted(productId, next);
      if (res.ok) setSaved(res.saved);
      else if (res.needsAuth) router.push(`/login?next=${encodeURIComponent(pathname)}` as "/login");
    });
  }

  return (
    <button
      type="button"
      className={clsx(s.button, s[variant], className)}
      aria-pressed={optimistic}
      aria-label={optimistic ? `Remove ${productName} from saved` : `Save ${productName}`}
      onClick={(e) => {
        e.preventDefault(); // cards are links underneath
        toggle();
      }}
    >
      <Icon name="heart" size={20} filled={optimistic} />
    </button>
  );
}
