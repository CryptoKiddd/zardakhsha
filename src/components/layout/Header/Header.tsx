import { Suspense } from "react";
import { Icon, IconButton } from "@/components/ui";
import { BagButton } from "@/features/cart/components/BagButton";
import { Logo } from "../Logo/Logo";
import { BackButton } from "./BackButton";
import { MenuButton } from "./MenuButton";
import s from "./Header.module.scss";

/**
 * The ONLY header in the app. Three variants, fixed 3-zone grid:
 *   A: [menu][search]  LOGO  [account][bag]    top-level screens
 *   B: [back]          LOGO  [bag]             inner screens
 *   C: [back?]         LOGO  [🔒 Secure]        checkout
 * Rendered by route-group layouts, never by pages.
 */
export type HeaderVariant = "a" | "b" | "c";

export function Header({ variant, showBack = true }: { variant: HeaderVariant; showBack?: boolean }) {
  return (
    <header className={s.header}>
      <div className={s.inner}>
        <div className={s.start}>
          {variant === "a" ? (
            <>
              <MenuButton />
              <IconButton icon="search" label="Search" href="/search" />
            </>
          ) : (
            showBack && <BackButton />
          )}
        </div>

        <div className={s.center}>
          <Logo />
        </div>

        <div className={s.end}>
          {variant === "a" && <IconButton icon="user" label="Account" href="/account" />}
          {variant !== "c" && (
            <Suspense fallback={<IconButton icon="bag" label="Bag" href="/bag" />}>
              <BagButton />
            </Suspense>
          )}
          {variant === "c" && (
            <span className={s.secure}>
              <Icon name="lock" size={18} />
              Secure
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
