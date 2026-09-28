---
name: code-review
description: Review Zardakhsha code changes (a diff, branch or PR) against the project's architecture, React 19 / Next.js 16 practices, design-system rules, navigation contract, security and conversion UX. Use before committing, when asked to "review", or after implementing a design.
---

# Zardakhsha code review

Review the **diff** (`git diff main...HEAD`, or staged changes), reading surrounding files as needed.
Report only real, specific problems: file, line, what's wrong, why it matters, the fix. Rank by severity:

- **Blocker**: bug, security hole, data leak, broken build, broken navigation contract
- **Should fix**: architecture/design-system violation, a11y failure, performance regression
- **Nit**: naming, small cleanups (keep these few)

Start by running `npm run check && npm run build` and include any failures as blockers.

## 1. Correctness & security

- [ ] Every Server Action re-checks the session when it touches user data, and validates **all** input with Zod.
- [ ] Actions return typed state for expected failures (`{ ok: false, message }`); they don't throw for validation.
- [ ] No user can read/modify another user's data (filter by `session.user.id`; see order ownership check).
- [ ] Redirect targets from the query string are relative-only (`safeNext`).
- [ ] Money stays in integer tetri; formatted only via `formatPrice`.
- [ ] Stock is checked/decremented atomically (`$elemMatch` + `$inc`), never read-then-write.
- [ ] Secrets only via `env()` / server code; nothing sensitive in client components or `NEXT_PUBLIC_*`.

## 2. Server/client boundary

- [ ] `"use client"` only where needed, and as low in the tree as possible.
- [ ] Client components don't import `queries.ts`, `@/models`, `@/lib/db`, `@/lib/auth`, or `Header`.
- [ ] Only plain serializable DTOs cross the boundary (no Mongoose docs, ObjectIds, Dates → ISO strings).
- [ ] New reads live in `queries.ts` with `import "server-only"` and `readDb()`; writes in `actions.ts` with `connectDb()`.

## 3. React 19 / Next.js 16

- [ ] Forms calling actions use `useActionState` (not `useState` + `fetch`), with the pending state wired to the button.
- [ ] Optimistic UI via `useOptimistic` inside a transition; non-urgent updates via `useTransition`.
- [ ] No `useEffect` for data fetching or for state derivable during render; effects have correct deps and cleanup.
- [ ] `params`, `searchParams`, `cookies()`, `headers()` are awaited; pages use `PageProps<"/route">`.
- [ ] Slow sections wrapped in `<Suspense>` with a same-geometry skeleton; request-level de-dupe with `cache()`.
- [ ] Mutations revalidate what they change (`revalidatePath`) so the header bag count/pages refresh.
- [ ] Lists have stable keys (ids/SKUs, not indexes for dynamic lists).
- [ ] Dynamic URLs use `routes.*`; no `as any` to silence typed routes.

## 4. Architecture & reuse

- [ ] Code is in the right place (see "Where does new code go?" in `CLAUDE.md`).
- [ ] No duplicated UI: an existing `ui/` or feature component was reused or extended.
- [ ] `components/ui` stays generic: no business logic, no data fetching, no feature imports.
- [ ] Props are typed and minimal; no boolean-prop explosions (prefer `variant`).
- [ ] Names describe intent (`ProductPurchase`, not `Box2`); comments explain _why_, not _what_.

## 5. Design system & styling

- [ ] Only tokens in SCSS: no raw hex, px spacing, font sizes or z-index numbers.
- [ ] Each module starts with `@use "abstracts" as *;` and uses the mixins (`heading`, `text`, `up()`, `tap-target`…).
- [ ] Mobile-first (base = 390px; `up()` for larger).
- [ ] No global styles leaked from a module; no `!important` (except `visually-hidden`).

## 6. Navigation contract

- [ ] No bottom tab bar anywhere; no header rendered inside a page.
- [ ] The page is in the correct route group for its header (A / B / C table in `CLAUDE.md`).
- [ ] One centered logo; back arrow only where the contract says; `backFallback` updated for new inner routes.
- [ ] Sticky elements don't overlap the header (`top: var(--header-h)`) and pages with `StickyActionBar` use `WithActionBar`.
- [ ] New menu links are added in `config/navigation.ts`, not hard-coded in components.

## 7. Accessibility

- [ ] Icon-only buttons have `label`/`aria-label`; images have meaningful `alt` (or `""` if decorative).
- [ ] Interactive elements are real `<button>`/`<a>`; tap targets ≥ 44px; focus visible.
- [ ] Form fields have labels; errors linked via `aria-describedby`; status messages use `role="status"`/`alert`.
- [ ] Color contrast meets WCAG AA; state isn't conveyed by color alone (e.g. selected chip has `aria-pressed`).

## 8. Performance & conversion UX

- [ ] `next/image` with correct `sizes`; `priority` only on the LCP image; no layout shift (fixed aspect ratios).
- [ ] No heavy client libraries added without need (carousels, date libs, UI kits).
- [ ] Buy path stays short: price near CTA, sticky Add to Bag, clear stock/delivery info, errors inline.
- [ ] Empty, loading and error states exist for new async UI.

## Output format

```
## Summary
<one paragraph: what the change does, overall verdict: Approve / Approve with fixes / Changes requested>

## Blockers
- path/to/file.tsx:42: <problem>. <why>. Fix: <concrete fix>

## Should fix
- …

## Nits
- …
```

If asked to apply fixes, fix blockers and should-fix items, re-run `npm run check && npm run build`, and report what changed.
