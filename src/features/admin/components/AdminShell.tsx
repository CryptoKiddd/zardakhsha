import Link from "next/link";
import { Icon } from "@/components/ui";
import { Logo } from "@/components/layout";
import { ADMIN_NAV } from "@/config/admin";
import type { StaffUser } from "../auth";
import { AdminNavLink } from "./AdminNavLink";
import s from "./AdminShell.module.scss";

const ROLE_LABEL = { owner: "Owner", manager: "Manager", fulfilment: "Fulfilment", customer: "Customer" } as const;

/**
 * Desktop admin frame (designed for 1920 × 1080, works from 1280px): sticky sidebar + top bar + content.
 * Below 1280px only a notice is shown: the admin is desktop-only for now.
 */
export function AdminShell({ user, children }: { user: StaffUser; children: React.ReactNode }) {
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className={s.shell}>
        <aside className={s.sidebar}>
          <div className={s.brand}>
            <Logo />
            <span className={s.brandTag}>Admin</span>
          </div>
          <nav aria-label="Admin" className={s.nav}>
            {ADMIN_NAV.map((group) => (
              <div key={group.heading} className={s.navGroup}>
                <p className={s.navHeading}>{group.heading}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <AdminNavLink href={item.href} icon={item.icon} label={item.label} />
                      ) : (
                        <span className={s.navItem} aria-disabled="true">
                          <Icon name={item.icon} size={20} />
                          {item.label}
                          <span className={s.soon}>Soon</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className={s.main}>
          <header className={s.topbar}>
            <Link href="/" className={s.storefront} target="_blank">
              View storefront <Icon name="arrowRight" size={16} />
            </Link>
            <div className={s.user}>
              <span className={s.avatar} aria-hidden>
                {initials}
              </span>
              <span className={s.userText}>
                <span className={s.userName}>{user.name}</span>
                <span className={s.userRole}>{ROLE_LABEL[user.role]}</span>
              </span>
            </div>
          </header>
          <main id="main" className={s.content}>
            {children}
          </main>
        </div>
      </div>

      <div className={s.desktopOnly}>
        <Icon name="lock" size={28} />
        <p className={s.desktopTitle}>The admin works on a desktop screen</p>
        <p>Open it on a computer, 1280px wide or more.</p>
        <Link href="/">Back to the shop</Link>
      </div>
    </>
  );
}
