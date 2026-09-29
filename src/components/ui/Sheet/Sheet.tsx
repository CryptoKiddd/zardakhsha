"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { IconButton } from "../IconButton/IconButton";
import s from "./Sheet.module.scss";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** bottom = mobile bottom sheet (filters, size guide). left = side drawer (burger menu). */
  side?: "bottom" | "left";
  /** Replace the default title row (e.g. the drawer shows the logo). */
  header?: ReactNode;
  /** Pinned below the scrolling body, e.g. the sheet's main action. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Accessible modal built on the native <dialog>: focus trap, Esc to close,
 * and inert background come from the browser, so no extra library is needed.
 */
export function Sheet({ open, onClose, title, side = "bottom", header, footer, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={clsx(s.sheet, s[side], footer != null && s.hasFooter)}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.panel}>
        {side === "bottom" && <span className={s.handle} aria-hidden />}
        <div className={s.head}>
          {header ?? <h2 className={s.title}>{title}</h2>}
          <IconButton icon="close" label="Close" onClick={onClose} />
        </div>
        <div className={s.body}>{children}</div>
        {footer != null && <div className={s.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
