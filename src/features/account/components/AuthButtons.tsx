"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

export function GoogleSignInButton({ callbackURL = "/account" }: { callbackURL?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      fullWidth
      loading={pending}
      iconStart={<Icon name="google" size={20} />}
      onClick={() =>
        startTransition(async () => {
          await authClient.signIn.social({ provider: "google", callbackURL });
        })
      }
    >
      Continue with Google
    </Button>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        })
      }
    >
      Sign out
    </Button>
  );
}
