"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { EmailSignIn } from "./EmailSignIn";
import { PhoneSignIn } from "./PhoneSignIn";
import s from "./SignIn.module.scss";

type Method = "phone" | "email";

/** Phone (default: most customers are on mobile in Georgia) or email, switched with a segmented control. */
export function SignInMethods({ next }: { next: string }) {
  const [method, setMethod] = useState<Method>("phone");

  return (
    <div className={s.methods}>
      <div className={s.segmented} role="group" aria-label="Sign in with">
        {(["phone", "email"] as const).map((m) => (
          <button key={m} type="button" className={s.segment} aria-pressed={method === m} onClick={() => setMethod(m)}>
            <Icon name={m === "phone" ? "phone" : "mail"} size={18} />
            {m === "phone" ? "Phone" : "Email"}
          </button>
        ))}
      </div>
      {method === "phone" ? <PhoneSignIn next={next} /> : <EmailSignIn next={next} />}
    </div>
  );
}
