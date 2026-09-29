import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container, Icon, type IconName } from "@/components/ui";
import { GoogleSignInButton } from "@/features/account/components/AuthButtons";
import { SignInMethods } from "@/features/account/components/SignInMethods";
import { getSession } from "@/lib/auth";
import s from "./login.module.scss";

export const metadata: Metadata = { title: "Sign in" };

const PILLARS: { icon: IconName; label: string }[] = [
  { icon: "flame", label: "Cloisonné technique" },
  { icon: "sparkle", label: "One-of-a-kind pieces" },
  { icon: "shield", label: "Hallmarked 925" },
];

/** Only allow same-site relative redirects (prevents open-redirect attacks via ?next=). */
function safeNext(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/account";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getSession()) redirect(next as "/account");
  const linkFailed = sp.error === "link";

  return (
    <div className={s.page}>
      <div className={s.hero}>
        <Image
          src="/images/home/craft.jpg"
          alt="An enameller setting glass enamel into a silver ring in the Tbilisi atelier"
          fill
          priority
          sizes="(min-width: 768px) 560px, 100vw"
        />
        <span className={s.heroChip}>
          <span className={s.dot} aria-hidden />
          800°C kiln-fired glass
        </span>
      </div>

      <Container className={s.body}>
        <section className={s.card} aria-labelledby="signin-title">
          <div className={s.intro}>
            <h1 id="signin-title" className={s.title}>
              Sign in
            </h1>
            <p className={s.eyebrow}>Zardakhsha Atelier</p>
            <p className={s.lead}>Track your orders, keep your ring size and check out faster.</p>
          </div>

          {linkFailed && (
            <p className={s.alert} role="alert">
              That sign-in link has expired or was already used. Send yourself a new one below.
            </p>
          )}

          <GoogleSignInButton callbackURL={next} />

          <p className={s.divider}>
            <span>or</span>
          </p>

          <SignInMethods next={next} />
        </section>

        <div className={s.guest}>
          <Link href="/checkout" className={s.guestLink}>
            Continue as guest <Icon name="arrowRight" size={18} />
          </Link>
          <p>You can check out without an account.</p>
        </div>

        <p className={s.secure}>
          <Icon name="lock" size={16} /> Passwordless and encrypted
        </p>

        <ul className={s.pillars}>
          {PILLARS.map((p) => (
            <li key={p.label}>
              <Icon name={p.icon} size={20} />
              {p.label}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
