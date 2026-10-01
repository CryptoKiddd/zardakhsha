"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui";
import s from "./AdminShell.module.scss";

/** Sidebar link that marks itself current (the layout persists across admin pages, so it can't know). */
export function AdminNavLink({ href, icon, label }: { href: Route; icon: IconName; label: string }) {
  const pathname = usePathname();
  return (
    <Link href={href} className={s.navItem} aria-current={pathname === href ? "page" : undefined}>
      <Icon name={icon} size={20} />
      {label}
    </Link>
  );
}
