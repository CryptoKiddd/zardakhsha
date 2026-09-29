"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon/Icon";
import { toast, toastStore, type ToastItem } from "./toast";
import s from "./Toast.module.scss";

const ICON: Record<ToastItem["tone"], IconName> = { success: "check", info: "sparkle", error: "close" };
const DEFAULT_MS = { success: 4000, info: 4000, error: 6000 } as const;
const SWIPE_PX = 56;
const EXIT_MS = 220;

/**
 * Renders the toasts. Mount once in the root layout. It's a manual popover so it sits in the browser's top
 * layer: native <dialog> sheets live there too, and a z-index alone could never place a toast above them.
 */
export function Toaster() {
  const items = useSyncExternalStore(toastStore.subscribe, toastStore.get, toastStore.getServer);
  const region = useRef<HTMLElement>(null);

  // Re-raise on every change so a toast fired while a sheet is open appears above it.
  useEffect(() => {
    const el = region.current;
    if (!el || !("showPopover" in el)) return;
    if (el.matches(":popover-open")) el.hidePopover();
    if (items.length > 0) el.showPopover();
  }, [items]);

  return (
    <section ref={region} popover="manual" className={s.region} aria-label="Notifications">
      <ol className={s.list}>
        {items.map((t, i) => (
          <ToastView key={t.id + t.createdAt} item={t} depth={i} />
        ))}
      </ol>
    </section>
  );
}

function ToastView({ item, depth }: { item: ToastItem; depth: number }) {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<number | null>(null);

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => toast.dismiss(item.id), EXIT_MS);
  }, [item.id]);

  // Auto-hide timer (a real side effect). Paused while hovered/focused or while the tab is hidden.
  useEffect(() => {
    if (paused) return;
    const ms = item.duration ?? DEFAULT_MS[item.tone];
    // `createdAt` in deps: a replaced toast (same id, new message) gets a fresh timer.
    let timer = setTimeout(close, ms);
    const onVisibility = () => {
      clearTimeout(timer);
      if (document.visibilityState === "visible") timer = setTimeout(close, ms);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, item.createdAt, item.duration, item.tone, close]);

  return (
    <li
      className={clsx(s.toast, s[item.tone], leaving && s.leaving)}
      // Errors interrupt politely-but-now; everything else waits for the screen reader to finish.
      role={item.tone === "error" ? "alert" : "status"}
      style={
        {
          "--depth": depth,
          "--drag": `${dragX}px`,
        } as React.CSSProperties
      }
      data-dragging={dragging || undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        start.current = e.clientX;
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (start.current != null) setDragX(e.clientX - start.current);
      }}
      onPointerUp={() => {
        if (start.current == null) return;
        start.current = null;
        setDragging(false);
        if (Math.abs(dragX) > SWIPE_PX) close();
        else setDragX(0);
      }}
    >
      <span className={s.icon} aria-hidden>
        <Icon name={ICON[item.tone]} size={16} />
      </span>
      <span className={s.text}>
        <span className={s.message}>{item.message}</span>
        {item.description && <span className={s.description}>{item.description}</span>}
      </span>
      {item.action &&
        (item.action.href ? (
          <Link href={item.action.href as "/"} className={s.action} onClick={close}>
            {item.action.label}
          </Link>
        ) : (
          <button
            type="button"
            className={s.action}
            onClick={() => {
              item.action?.onClick?.();
              close();
            }}
          >
            {item.action.label}
          </button>
        ))}
      <button type="button" className={s.close} aria-label="Dismiss notification" onClick={close}>
        <Icon name="close" size={16} />
      </button>
    </li>
  );
}
