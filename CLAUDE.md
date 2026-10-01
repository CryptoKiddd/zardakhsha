@AGENTS.md

# Zardakhsha: Georgian enamel jewelry shop

Mobile-first e-commerce for handmade enamel jewelry (rings, earrings, bracelets, pendants) in silver and gold,
plus enamel decorations for the home (vases, plant pots, plates, boxes).
The goal of every screen is **conversion**: fast, clear, one obvious next action.

## Stack

- **Next.js 16** App Router, React 19, TypeScript (strict), Turbopack
- **SCSS Modules** + design tokens (CSS custom properties). No Tailwind, no CSS-in-JS, no UI kit.
- **MongoDB + Mongoose 9** for shop data; **Better Auth** (Google sign-in) stores users in the same DB
- **Zod** for every input that crosses the server boundary

## Commands

```bash
npm run dev          # http://localhost:3000
npm run check        # typecheck + lint + prettier: run before every commit
npm run build        # production build (must pass)
npm run seed         # demo products + reviews + decorations (wipes products; reads .env / .env.local)
npm run seed:decorations  # upsert only the demo decorations (safe, touches nothing else)
npm run db:migrate   # add missing defaults + indexes after schema changes (never deletes)
npm run order:status -- ZK-123456 [status]  # show / move an order along its lifecycle
npm run user:role -- you@example.com owner  # grant / remove admin access (owner, manager, fulfilment, customer)
npm run seed:orders  # demo orders for the admin dashboard (`-- --clear` removes only those)
npm run format       # prettier --write
```

## Folder structure

```
src/
├── app/                        # ROUTES ONLY: thin pages that compose features
│   ├── (main)/                 # Header A: home, shop/[slug], account (dashboard)
│   ├── (inner)/                # Header B: product/[slug], reviews, search, bag, login, account/*, about, contact
│   ├── (checkout)/             # Header C: checkout, order/[number] (no back arrow)
│   ├── (admin)/admin/          # Admin (desktop only, ≥1280px, designed for 1920×1080): own shell, staff roles only
│   ├── api/auth/[...all]/      # Better Auth handler
│   ├── layout.tsx              # <html>, fonts, globals.scss
│   ├── not-found.tsx / error.tsx
├── components/
│   ├── ui/                     # Design-system primitives (Button, Chip, Sheet, Field, Price…). No data, no business logic.
│   └── layout/                 # Header, Logo, MenuDrawer, Footer, StickyActionBar, AnnouncementBar
├── features/<domain>/          # products, cart, reviews, account, checkout
│   ├── components/             # Feature UI (ProductCard, CartLines, ReviewForm…)
│   ├── queries.ts              # "server-only" reads → return DTOs
│   ├── actions.ts              # "use server" mutations (Server Actions)
│   ├── schemas.ts / types.ts   # Zod schemas, DTO types
├── models/                     # Mongoose schemas. Import via "@/models" (server-only barrel)
├── lib/                        # db, auth, env, format: framework glue
├── config/                     # navigation.ts (routes + menu + back rules), shop.ts (business constants)
├── styles/                     # abstracts/ (mixins, breakpoints), base/ (tokens, reset), globals.scss
└── fonts/                      # self-hosted variable fonts
```

**Where does new code go?**

| You are adding…                                 | Put it in                                           |
| ----------------------------------------------- | --------------------------------------------------- |
| A generic visual element used in 2+ features    | `components/ui/<Name>/` + export from `ui/index.ts` |
| Something about products/cart/reviews/…         | `features/<domain>/components/`                     |
| A DB read                                       | `features/<domain>/queries.ts` (use `readDb()`)     |
| A mutation / form submit                        | `features/<domain>/actions.ts` (use `connectDb()`)  |
| A new page                                      | `app/(group)/…/page.tsx`: pick the group by header  |
| A color, size, spacing, radius, shadow, z-index | `styles/base/_tokens.scss` only                     |
| A URL to a dynamic route                        | `routes.*` in `config/navigation.ts`                |

## Navigation contract (do not break)

- **No bottom tab bar. Ever.** Only the top header navigates.
- The header is rendered by **route-group layouts**, never by pages. Pick the header by placing the page in the right group.
  - **A** `[☰][🔍] LOGO [👤][👜]`: top-level: `/`, `/shop/*`, `/account`
  - **B** `[←] LOGO [👜]`: inner: `/product/*`, `/product/*/reviews`, `/search`, `/bag`, `/login`, `/account/*`, `/about`, `/contact`
  - **C** `[←] LOGO [🔒 Secure]`: `/checkout`; `/order/*` has no back arrow
- One logo per screen: `ZARDAKHSHA` + `ATELIER`, centered, English only.
- Back arrow: `router.back()` if the user came from inside the shop, else `backFallback()` in `config/navigation.ts`.
- `StickyActionBar` (bottom) is for **actions** only (Add to Bag / Checkout / Pay / Write a review) on product, reviews, bag, checkout. Wrap the page in `<WithActionBar>`.
- Sticky sub-bars (filters) stick at `top: var(--header-h)`: **below** the header, never over it.
- **Admin** (`/admin`) is separate from the storefront: `AdminShell` (sidebar + top bar), no storefront header,
  footer or action bar. Every admin page and action calls `requireStaff()`; layouts alone aren't a security
  boundary (they don't re-run on client navigation). Unbuilt sections show "Soon" in the sidebar, never dead links.

## React / Next.js rules

1. **Server Components by default.** Add `"use client"` only for state, effects, event handlers or browser APIs. Keep client components small ("islands") and push them to the leaves.
2. **Data flow:** page (server) → `queries.ts` → DTO → props. Never pass Mongoose documents to the client; map them to plain DTOs (`mappers.ts`).
3. **Mutations = Server Actions** in `actions.ts`. Validate with Zod, check the session, return a typed state object (`{ ok, message, errors }`). Never throw for validation errors.
4. **Modern hooks, used for what they're for:**
   - `useActionState(action, initial)`: forms that call a Server Action (pending + result state). See `ProductPurchase`, `ReviewForm`, `AddressForm`, `CheckoutForm`.
   - `useOptimistic`: instant UI for mutations (cart quantity/remove). See `CartLines`.
   - `useTransition`: non-urgent updates (sort change, sign-in) so the current UI stays interactive.
   - `useFormStatus`: pending state inside a nested submit button.
   - `use(promise)`: unwrap a promise passed from a Server Component into a client component.
   - `cache()` from React: de-dupe a query within one request (`getProductBySlug`, `getSession`).
   - Avoid `useEffect` for data fetching or derived state. Derive during render; fetch on the server.
5. **Streaming:** wrap independent slow sections in `<Suspense>` with a skeleton that has the **same geometry** (see `ProductGridSkeleton`). `key` the Suspense on filter state to re-show the fallback.
6. **URL is state** for filters, sort, search, review filter: shareable and back-button friendly.
7. **Next 16 APIs:** `params`/`searchParams`/`cookies()`/`headers()` are async. Use the global `PageProps<"/route">` / `LayoutProps` types. Typed routes are on: use `routes.*` builders for dynamic URLs.
8. **Money** is an integer in tetri (`150_00` = ₾150). Format only with `formatPrice()`.
9. **Security:** re-check auth inside every action (never trust the client), validate every input with Zod, only accept relative `?next=` redirects, never expose other users' data (see order page ownership check).

## Styling rules

- Every component: `Name.tsx` + `Name.module.scss`, first line `@use "abstracts" as *;`.
- **Only tokens:** `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--text-*)`, `var(--z-*)`. No raw hex, px spacing or z-index numbers in components (1px borders are fine).
- **Mobile-first:** base styles target 390px; scale up with `@include up(md) { … }` (`sm` 480, `md` 768, `lg` 1024, `xl` 1440).
- Tap targets ≥ 44px (`@include tap-target`). Inputs use 16px font (no iOS zoom).
- Use mixins: `heading()`, `text()`, `eyebrow`, `scroll-row`, `line-clamp()`, `focus-ring`, `visually-hidden`.
- Animations use `--dur-*` / `--ease-out` (reduced motion is handled globally).

## Import rules (ESLint enforces some)

- UI primitives: `@/components/ui`. Layout: `@/components/layout`, **except `Header`**, which is server-only: import from `@/components/layout/Header/Header`.
- Models: `@/models` only (server-only). Type-only imports from `@/models/Product` are allowed.
- A client component must never import a `queries.ts`, `@/models`, `@/lib/db` or `@/lib/auth`. `server-only` will fail the build if it does.

## Design workflow

The design comes from Google Stitch / Figma. To implement or update a screen, follow `.claude/skills/implement-design/SKILL.md`.
Before finishing any change, run the review in `.claude/skills/code-review/SKILL.md`.

## Known TODOs

- Payments: Bank of Georgia in `lib/payments/bog.ts` (checkout → BOG hosted page → callback `/api/payments/bog` + order-page sync, both re-read status from BOG). Needs `BOG_CLIENT_ID` / `BOG_CLIENT_SECRET`; verify field names against BOG's docs when onboarding.
- Admin panel (product CRUD, image upload to Cloudinary/R2, orders) is phase 2: plan it as `app/(admin)/admin/*` behind a role check.
- Newsletter subscribe is a UI-only placeholder.
- Admin: only the Dashboard exists. Next: orders, products (editor + costs), stock, transactions, customers,
  storefront control, promotions, reviews, settings, team. Per-role permissions inside the admin are not split
  yet (any staff role sees everything).
- Consider `cacheComponents` + `"use cache"` for product queries once the catalog is stable.
