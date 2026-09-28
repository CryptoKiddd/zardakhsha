"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "@/components/ui";
import { SORT_OPTIONS } from "../listing";
import type { SortKey } from "../types";
import s from "./Filters.module.scss";

/** Compact "Sort: Featured ▾". Native <select> so phones get their own picker. */
export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // Transition keeps the current grid visible (dimmed) while the new one streams in.
  const [pending, startTransition] = useTransition();

  return (
    <label className={s.sort} data-pending={pending || undefined}>
      <span className={s.sortLabel}>Sort:</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          const query = next.toString();
          startTransition(() => router.replace(`${pathname}${query ? `?${query}` : ""}` as Route, { scroll: false }));
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={16} className={s.sortChevron} />
    </label>
  );
}
