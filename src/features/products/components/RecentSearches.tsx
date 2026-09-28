"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Icon, IconButton } from "@/components/ui";
import { routes } from "@/config/navigation";
import { recentSearches } from "../recent-searches";
import s from "./RecentSearches.module.scss";

/** This device's last searches (localStorage). Renders nothing until there is history. */
export function RecentSearches({ className }: { className?: string }) {
  const terms = useSyncExternalStore(recentSearches.subscribe, recentSearches.get, recentSearches.getServer);
  if (terms.length === 0) return null;

  return (
    <section className={className} aria-labelledby="recent-title">
      <div className={s.head}>
        <h2 id="recent-title" className={s.title}>
          <Icon name="clock" size={20} className={s.titleIcon} />
          Recent Searches
        </h2>
        <button type="button" className={s.clear} onClick={recentSearches.clear}>
          Clear all
        </button>
      </div>
      <ul className={s.list}>
        {terms.map((t) => (
          <li key={t} className={s.row}>
            <Link href={routes.search(t)} className={s.link}>
              <Icon name="clock" size={18} className={s.muted} />
              <span className={s.text}>{t}</span>
            </Link>
            <IconButton
              icon="close"
              label={`Remove "${t}" from recent searches`}
              onClick={() => recentSearches.remove(t)}
              className={s.muted}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
