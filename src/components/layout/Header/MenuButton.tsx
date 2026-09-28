"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui";
import { MenuDrawer } from "../MenuDrawer/MenuDrawer";

export function MenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton
        icon="menu"
        label="Open menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      />
      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
