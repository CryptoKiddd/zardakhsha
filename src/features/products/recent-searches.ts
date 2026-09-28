// Per-device recent searches in localStorage, exposed as an external store for useSyncExternalStore.
// Client-only module; nothing here is sent to the server.

const KEY = "zk_recent_searches";
const MAX = 5;
const EMPTY: string[] = [];

const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX) : [];
  } catch {
    cache = []; // storage blocked (private mode) or corrupt JSON
  }
  return cache;
}

function write(list: string[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable: keep the in-memory list for this session.
  }
  listeners.forEach((l) => l());
}

export const recentSearches = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  get: read,
  /** Server snapshot: always empty, so the list renders after hydration without a mismatch. */
  getServer: () => EMPTY,
  add(term: string) {
    const t = term.trim();
    if (t.length < 2) return;
    write([t, ...read().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX));
  },
  remove(term: string) {
    write(read().filter((x) => x !== term));
  },
  clear() {
    write([]);
  },
};
