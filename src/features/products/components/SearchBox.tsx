"use client";

import Form from "next/form";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Icon, IconButton } from "@/components/ui";
import { routes } from "@/config/navigation";
import { recentSearches } from "../recent-searches";
import s from "./SearchBox.module.scss";

const DEBOUNCE_MS = 300;

/**
 * Live search: typing updates ?q= (debounced, in a transition so the input never blocks) and the server
 * streams new results. Still a real <form>, so Enter and no-JS submits work.
 */
export function SearchBox({ defaultValue, category }: { defaultValue: string; category?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const input = useRef<HTMLInputElement>(null);

  // ?q= changed from outside (recent/trending link, back button): show it. Our own debounced navigations are
  // skipped, otherwise a slow response for "cob" would overwrite "coba" while the user is still typing.
  const [seen, setSeen] = useState(defaultValue);
  const [sent, setSent] = useState(defaultValue);
  if (defaultValue !== seen) {
    setSeen(defaultValue);
    if (defaultValue !== sent) {
      setValue(defaultValue);
      setSent(defaultValue);
    }
  }

  function go(q: string) {
    clearTimeout(timer.current);
    setSent(q);
    startTransition(() => router.replace(routes.search(q, category), { scroll: false }));
  }

  function onChange(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    const q = next.trim();
    // Queries need 2+ characters to match anything, so don't navigate for a single letter.
    if (q.length === 1) return;
    timer.current = setTimeout(() => go(q), DEBOUNCE_MS);
  }

  return (
    <Form
      action="/search"
      role="search"
      className={s.form}
      data-pending={pending || undefined}
      onSubmit={() => {
        clearTimeout(timer.current);
        recentSearches.add(value);
      }}
    >
      <Icon name="search" size={20} className={s.icon} />
      <input
        ref={input}
        name="q"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => recentSearches.add(value)}
        placeholder="Search rings, earrings, colors…"
        aria-label="Search products"
        autoFocus={!defaultValue}
        enterKeyHint="search"
        className={s.input}
      />
      {category && <input type="hidden" name="category" value={category} />}
      {value && (
        <IconButton
          icon="close"
          label="Clear search"
          className={s.clear}
          onClick={() => {
            setValue("");
            go("");
            input.current?.focus();
          }}
        />
      )}
    </Form>
  );
}
