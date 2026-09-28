import Link from "next/link";
import { MENU_PRIMARY, MENU_SECONDARY } from "@/config/navigation";
import { Logo } from "../Logo/Logo";
import s from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <Logo />
        <div className={s.columns}>
          <nav aria-label="Shop">
            <h2 className={s.heading}>Shop</h2>
            <ul>
              {MENU_PRIMARY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Atelier">
            <h2 className={s.heading}>Atelier</h2>
            <ul>
              {MENU_SECONDARY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className={s.legal}>© {new Date().getFullYear()} Zardakhsha Atelier · Handmade in Georgia</p>
      </div>
    </footer>
  );
}
