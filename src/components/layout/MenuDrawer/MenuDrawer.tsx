"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon, Sheet } from "@/components/ui";
import { MENU_ACCOUNT, MENU_PRIMARY, MENU_SECONDARY, type NavLink } from "@/config/navigation";
import { Logo } from "../Logo/Logo";
import s from "./MenuDrawer.module.scss";

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

  return (
    <Sheet open={open} onClose={onClose} title="Menu" side="left" header={<Logo />}>
      <nav aria-label="Main">
        <LinkList links={MENU_PRIMARY} large current={pathname} />
        <hr className={s.divider} />
        <LinkList links={MENU_SECONDARY} current={pathname} />
        <hr className={s.divider} />
        <LinkList links={MENU_ACCOUNT} current={pathname} />
      </nav>
    </Sheet>
  );
}

function LinkList({ links, large, current }: { links: NavLink[]; large?: boolean; current: string }) {
  return (
    <ul className={large ? s.large : s.small}>
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className={s.link} aria-current={current === l.href ? "page" : undefined}>
            {l.label}
            {large && <Icon name="chevronRight" size={18} />}
          </Link>
        </li>
      ))}
    </ul>
  );
}
