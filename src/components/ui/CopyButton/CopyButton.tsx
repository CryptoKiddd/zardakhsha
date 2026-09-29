"use client";

import { useState } from "react";
import { IconButton } from "../IconButton/IconButton";
import { toast } from "../Toast/toast";

/** Copies `value` to the clipboard; the icon turns into a check for a moment as confirmation. */
export function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied", { id: "copy", description: value, duration: 2500 });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context / permissions): the value is still visible to copy by hand.
    }
  }

  return <IconButton icon={copied ? "check" : "copy"} label={label} onClick={copy} className={className} />;
}
