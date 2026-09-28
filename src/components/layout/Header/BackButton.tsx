"use client";

import { usePathname, useRouter } from "next/navigation";
import { IconButton } from "@/components/ui";
import { backFallback } from "@/config/navigation";

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
      onClick={() => {
        const cameFromShop =
          typeof document !== "undefined" &&
          document.referrer.startsWith(window.location.origin) &&
          window.history.length > 1;
        if (cameFromShop) router.back();
        else router.push(backFallback(pathname));
      }}
    />
  );
}
