import Link from "next/link";
import s from "./Logo.module.scss";

/** The only logo. One per screen, always centered in the header. English only. */
export function Logo() {
  return (
    <Link href="/" className={s.logo} aria-label="Zardakhsha Atelier, home">
      <span className={s.wordmark}>ZARDAKHSHA</span>
      <span className={s.sub}>ATELIER</span>
    </Link>
  );
}
