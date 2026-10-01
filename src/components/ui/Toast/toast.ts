// Toast store: call `toast.success("Added to bag", { … })` from any client component.
// <Toaster /> (in the root layout) subscribes with useSyncExternalStore; no provider or context needed.

export type ToastTone = "success" | "info" | "error";

export type ToastAction = { label: string; href?: string; onClick?: () => void };

export type ToastOptions = {
  description?: string;
  action?: ToastAction;
  /** ms before it hides itself. Defaults: 4s, errors 6s. */
  duration?: number;
  /** Same id = replace instead of stacking (e.g. adding three things quickly shows one toast, updated). */
  id?: string;
};

export type ToastItem = ToastOptions & { id: string; tone: ToastTone; message: string; createdAt: number };

const MAX_VISIBLE = 3;
/** One shared empty list: useSyncExternalStore needs the server snapshot to be the same object every call. */
const NONE: ToastItem[] = [];
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
let seq = 0;

function emit() {
  listeners.forEach((l) => l());
}

function show(tone: ToastTone, message: string, opts: ToastOptions = {}): string {
  // Default id from tone+message: repeating the same action refreshes the toast instead of piling up.
  const id = opts.id ?? `${tone}:${message}`;
  const next: ToastItem = { ...opts, id, tone, message, createdAt: Date.now() + seq++ };
  items = [next, ...items.filter((t) => t.id !== id)].slice(0, MAX_VISIBLE);
  emit();
  return id;
}

export const toast = Object.assign((message: string, opts?: ToastOptions) => show("info", message, opts), {
  success: (message: string, opts?: ToastOptions) => show("success", message, opts),
  error: (message: string, opts?: ToastOptions) => show("error", message, opts),
  dismiss(id: string) {
    items = items.filter((t) => t.id !== id);
    emit();
  },
});

export const toastStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  get: () => items,
  getServer: () => NONE,
};
