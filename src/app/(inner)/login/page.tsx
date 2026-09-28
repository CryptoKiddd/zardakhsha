import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink, Container } from "@/components/ui";
import { GoogleSignInButton } from "@/features/account/components/AuthButtons";
import { getSession } from "@/lib/auth";
import s from "./login.module.scss";

export const metadata: Metadata = { title: "Sign in" };

/** Only allow same-site relative redirects (prevents open-redirect attacks via ?next=). */
function safeNext(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/account";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next as "/account");

  return (
    <Container className={s.page}>
      <div className={s.intro}>
        <h1>Welcome</h1>
        <p>Sign in to track orders, save addresses and check out faster.</p>
      </div>
      <GoogleSignInButton callbackURL={next} />
      <p className={s.divider}>or</p>
      <ButtonLink href="/checkout" variant="ghost">
        Continue as guest
      </ButtonLink>
    </Container>
  );
}
