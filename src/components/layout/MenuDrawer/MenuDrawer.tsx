"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon, Sheet, type IconName } from "@/components/ui";
import { CATEGORIES, MENU_ACCOUNT, MENU_ATELIER, MENU_COLLECTIONS, routes } from "@/config/navigation";
import { Logo } from "../Logo/Logo";
import s from "./MenuDrawer.module.scss";

const ATELIER_ICON: Record<string, IconName> = { "/about": "sparkle", "/contact": "mail" };
const ACCOUNT_ICON: Record<string, IconName> = {
  "/account": "user",
  "/account/orders": "bag",
  "/account/wishlist": "heart",
};

/**
 * Burger menu (slides in from the left, where the button is). Search, a card of categories with photos,
 * a 2 × 2 grid of collections, atelier links, and account tabs pinned at the bottom so they never need scrolling.
 */
export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // Close after navigating. Compare against the previous path so opening doesn't close it.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Menu"
      side="left"
      header={<Logo />}
      footer={
        <nav aria-label="Account" className={s.accountNav}>
          {MENU_ACCOUNT.map((l) => (
            <Link key={l.href} href={l.href} className={s.accountTab} aria-current={current(l.href)}>
              <Icon name={ACCOUNT_ICON[l.href] ?? "user"} size={20} />
              {l.label}
            </Link>
          ))}
        </nav>
      }
    >
      <nav aria-label="Main" className={s.menu}>
        <Link href="/search" className={s.search}>
          <Icon name="search" size={18} />
          Search rings, earrings, decor…
        </Link>

        <section aria-labelledby="menu-shop">
          <h2 id="menu-shop" className={s.label}>
            Shop
          </h2>
          <ul className={s.categories}>
            {CATEGORIES.map((c) => {
              const href = routes.shop(c.slug);
              return (
                <li key={c.slug}>
                  <Link href={href} className={s.category} aria-current={current(href)}>
                    <span className={s.thumb}>
                      <Image src={`/images/home/${c.slug}.jpg`} alt="" fill sizes="40px" />
                    </span>
                    <span className={s.name}>{c.label}</span>
                    <Icon name="chevronRight" size={18} className={s.chevron} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="menu-collections">
          <h2 id="menu-collections" className={s.label}>
            Collections
          </h2>
          <ul className={s.pills}>
            {MENU_COLLECTIONS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={s.pill} aria-current={current(l.href)}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="menu-atelier">
          <h2 id="menu-atelier" className={s.label}>
            Atelier
          </h2>
          <ul className={s.links}>
            {MENU_ATELIER.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={s.link} aria-current={current(l.href)}>
                  <Icon name={ATELIER_ICON[l.href] ?? "chevronRight"} size={18} className={s.linkIcon} />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </nav>
    </Sheet>
  );
}
