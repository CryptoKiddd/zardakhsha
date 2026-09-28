"use client";

import { usePathname, useRouter } from "next/navigation";
import { IconButton } from "@/components/ui";
import { backFallback } from "@/config/navigation";

type NavigationApi = { currentEntry?: { index: number } | null };

const EXIT_TIMEOUT_MS = 600;

/**
 * Plays the page's exit animation (if it opted in with `data-exit`, see styles/base/_view-transitions.scss)
 * and resolves when it ends. React commits back/forward navigations synchronously, so a <ViewTransition exit>
 * never runs for router.back(): the page has to animate out *before* we navigate.
 */
function playExit(): Promise<void> {
  const page = document.querySelector<HTMLElement>("[data-exit]");
  if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    // animationend bubbles: only the page's own exit counts, not a child's animation finishing.
    page.addEventListener("animationend", (e) => e.target === page && done());
    setTimeout(done, EXIT_TIMEOUT_MS); // never strand the user if the animation doesn't fire
    page.dataset.exiting = "";
  });
}

/**
 * True when the previous history entry is a page of this shop.
 * The Navigation API only lists same-origin entries, so index > 0 means "there's a shop page behind us".
 * `document.referrer` is the fallback for browsers without it; it isn't updated by client-side navigations,
 * so on its own it would send in-app users to the fallback instead of back.
 */
function cameFromShop(): boolean {
  const nav = (window as { navigation?: NavigationApi }).navigation;
  if (nav?.currentEntry) return nav.currentEntry.index > 0;
  return document.referrer.startsWith(window.location.origin) && window.history.length > 1;
}

/**
 * Goes back in history when the user navigated inside the shop,
 * otherwise to the logical parent screen (deep links from Instagram/Google).
 */
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <IconButton
      icon="back"
      label="Back"
      onClick={async () => {
        const inShop = cameFromShop();
        await playExit();
        if (inShop) router.back();
        else router.push(backFallback(pathname));
      }}
    />
  );
}
