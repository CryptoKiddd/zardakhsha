"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { IconButton } from "../IconButton/IconButton";
import s from "./Sheet.module.scss";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /**
   * bottom: mobile action sheet (filters, size guide, quick add).
   * left: navigation drawer (burger menu), because it opens from the button on the left.
   * right: detail / edit drawer (order detail, admin edits, desktop panels), slides in from the right.
   */
  side?: "bottom" | "left" | "right";
  /** Replace the default title row (e.g. the drawer shows the logo). */
  header?: ReactNode;
  /** Pinned below the scrolling body, e.g. the sheet's main action. */
  footer?: ReactNode;
  children: ReactNode;
};

/** Longest exit animation + margin: never leave a sheet stuck open if `animationend` doesn't fire. */
const EXIT_FALLBACK_MS = 400;

/**
 * Accessible modal built on the native <dialog>: focus trap, Esc to close, inert background.
 * Opening: showModal(), then the panel slides in (CSS). Closing (button, Esc, backdrop, or `open` → false):
 * the panel slides out first, and only then is the dialog really closed, so it never just vanishes.
 */
export function Sheet({ open, onClose, title, side = "bottom", header, footer, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const panel = dialog.firstElementChild as HTMLElement;

    if (open) {
      if (!dialog.open) dialog.showModal();
      // Slide in only after the first frame is on screen (double rAF). Starting in the same frame lets a
      // slow first paint swallow most of the motion, and the sheet looks like it jumps into place.
      // (Reopened mid-exit: the dialog is still open and the transition simply reverses.)
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => (dialog.dataset.shown = ""));
      });
      return () => cancelAnimationFrame(frame);
    }

    if (dialog.open) {
      // Slide out (a DOM attribute, not state: nothing to re-render), then close for real.
      delete dialog.dataset.shown;
      if (parseFloat(getComputedStyle(panel).transitionDuration) === 0) {
        dialog.close(); // reduced motion: no transition, so no transitionend either
        return;
      }
      const finish = () => dialog.close();
      const onEnd = (e: TransitionEvent) => e.target === panel && e.propertyName === "transform" && finish();
      panel.addEventListener("transitionend", onEnd);
      const timer = setTimeout(finish, EXIT_FALLBACK_MS);
      return () => {
        panel.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
      };
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={clsx(s.sheet, s[side], footer != null && s.hasFooter)}
      aria-label={title}
      // Esc: run our animated close instead of the browser's instant one.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
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
