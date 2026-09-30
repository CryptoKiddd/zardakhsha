---
name: implement-design
description: Implement or update a Zardakhsha screen or component from a Google Stitch / Figma design (link, export, or screenshot) using the project's SCSS tokens, reusable components and navigation contract. Use whenever the task is "build this screen", "match the design", "implement from Figma/Stitch", or a UI change driven by a design.
---

# Implement a design in Zardakhsha

The design is a **reference, not code to paste**. Stitch/Figma exports use hard-coded values, absolute
positioning and made-up navigation. Translate intent into this codebase's components, tokens and rules.

## 1. Get the design

Pick whichever source is available, in this order:

1. **Figma link** (Figma MCP): load the `figma:figma-design-to-code` skill first, then `get_design_context` +
   `get_screenshot` for the frame. Use `get_variable_defs` to compare Figma variables with our tokens.
2. **Stitch MCP** (`.mcp.json` → `stitch`, needs `STITCH_API_KEY`): list the project's screens, fetch the
   screen's HTML and screenshot. If the MCP connection fails (Claude Code only expands `${STITCH_API_KEY}` from
   the process environment, not `.env`), call `https://stitch.googleapis.com/mcp` directly with the key from
   `.env` in an `X-Goog-Api-Key` header (JSON-RPC `tools/call`). Stitch's stored screenshots are sometimes
   blank: render the screen's HTML at 390px in headless Chrome instead.
3. **Exported HTML / screenshot** in `design/` or attached to the chat.

Always look at a **screenshot** of the screen before writing code. Note: which screen it is, which header it
should use, the sections top to bottom, and every interactive element.

## 2. Map the screen to the architecture

Write this plan down (in your reply) before coding:

| Question                                    | Answer comes from                                  |
| ------------------------------------------- | -------------------------------------------------- |
| Which route and which **route group**?      | Header A/B/C table in `CLAUDE.md`                  |
| Which existing components cover each block? | `components/ui/index.ts`, `features/*/components/` |
| What data does it need? Which query?        | `features/<domain>/queries.ts` (add one if needed) |
| What mutations? Which action?               | `features/<domain>/actions.ts`                     |
| What is interactive (client island)?        | Only the parts with state/handlers                 |

**Navigation from the design is ignored.** If the design shows a bottom tab bar, a different header, a second
logo or a back arrow where the contract says otherwise, follow `CLAUDE.md`, not the design. Mention the
discrepancy in your summary.

## 3. Tokens: translate every value

Never copy a raw value from the design. Map it:

| Design value                 | Use                                           |
| ---------------------------- | --------------------------------------------- |
| page background              | `var(--color-bg)`                             |
| card / panel                 | `var(--color-surface)`                        |
| tinted panel / icon tile     | `var(--color-surface-alt)`                    |
| primary text                 | `var(--color-text)`                           |
| secondary text               | `var(--color-muted)`                          |
| borders / dividers           | `var(--color-border)`                         |
| primary button               | `<Button>` (uses `var(--gradient-accent)`)    |
| selected / soft accent fill  | `var(--color-accent-soft)`                    |
| red price / sale             | `var(--color-sale)`                           |
| silver / gold details        | `var(--color-silver)` / `var(--color-gold)`   |
| gold text (eyebrows, links)  | `var(--color-gold-text)`                      |
| 4/8/12/16/24/32/48/64 px     | `var(--space-1…8)`                            |
| button / card / sheet radius | `var(--radius-sm / md / lg)`, pills `pill`    |
| Serif headings               | `@include heading(2xl / xl / lg)`             |
| 12/14/16/20/24/32 text       | `@include text(xs / sm / md / lg / xl / 2xl)` |
| Uppercase tracked label      | `@include eyebrow`                            |

If a value doesn't map (e.g. a new brand color or an 18px gap), **don't invent a one-off**: either round to
the nearest token or add a new token to `styles/base/_tokens.scss` and say so in the summary.

## 4. Stitch is a guide, not a spec

Take the layout, hierarchy and mood from Stitch, then implement it cleanly. Stitch output is often
inconsistent, so these rules win over the mockup:

1. **Only the necessary copy.** Stitch over-writes: poetic sub-labels, duplicate trust lines, bilingual echoes,
   "Atelier Vault" jargon, invented stats and testimonials. Keep one clear heading, at most one supporting
   line, and plain action verbs ("Add to bag", not "Acquire"). Never ship made-up numbers, reviews or claims
   (certificates, "256-bit", delivery dates) the shop can't back.
2. **Lists are real lists.** `<ul>/<ol>` with one row component; every row the same height and alignment;
   labels on one line (`white-space: nowrap` + `line-clamp(1)` / ellipsis for names, never `<br>`); values
   right-aligned with `tabular-nums`; dividers from tokens; an empty state for every list.
3. **Buttons are one line and one height.** Sizes come from `<Button size="md|lg">` (40 / 48px) and never grow
   because text wrapped: shorten the label instead (`white-space: nowrap` is in the base style). Keep the
   component's padding (`--space-4` / `--space-5` inline); don't copy Stitch's missing or uneven padding.
   Icon + label use the built-in `gap`; icon-only controls are 44px tap targets with an `aria-label`.
4. **Drawers slide from where they belong.** `<Sheet side="left">`: navigation (opens from the burger on the
   left). `side="right"`: detail / edit panels and desktop side panels, sliding in from the right edge.
   `side="bottom"`: mobile action sheets (filters, options, size). Pinned actions go in the Sheet `footer`.
   Always the native-dialog Sheet (focus trap, Esc, backdrop click), never a hand-rolled overlay.
5. **Spacing from tokens, consistently.** Same gap between repeated items, same inner padding for every card
   of a kind, sections separated by `Section`. If Stitch shows 13px here and 18px there, pick the nearest token
   and use it everywhere.
6. **Numbers and money:** `formatPrice()` only, lining + tabular figures in prices (the serif defaults to
   old-style), units spelled once ("18 × 32 cm", not "18cm x 32 cm").

## 5. Build

1. **Reuse first.** Search `components/ui` and `features/*/components` before creating anything. Extend an
   existing component with a prop/variant rather than cloning it.
2. **New component checklist:** folder `Name/Name.tsx` + `Name.module.scss`; typed props; no data fetching in
   `components/ui`; export from the barrel; accessible name for icon-only controls; `@use "abstracts" as *;`.
3. **Server by default**, `"use client"` only on the interactive leaf. Pass DTOs, not documents.
4. **Mobile first** at 390px, then `@include up(md)` / `up(lg)` for the desktop grid (2 → 3 → 4 columns).
5. **Images:** `next/image` with `fill` + correct `sizes`, `priority` only for the first visible image,
   4:5 aspect ratio for product imagery, meaningful `alt` (empty `alt=""` only when decorative).
6. **Loading states:** every async section gets `<Suspense>` with a same-size skeleton.
7. **Empty and error states:** design them (empty bag, no results, sold out) even if the mockup doesn't.
8. **Conversion details** the design may omit but we always keep: sticky Add to Bag, price near the CTA,
   low-stock nudge, free-shipping progress, trust row, clear error messages next to the field.

## 6. Verify

```bash
npm run check && npm run build
```

Then compare against the design at **390px and 1440px** (Playwright/Chrome screenshot or the in-app browser):
spacing rhythm, type scale, alignment, header variant, sticky bars not covering content, tap targets ≥ 44px,
keyboard focus visible, no horizontal scroll, no wrapped button labels, list rows equal height.
Animated UI (carousels, transitions, toasts): headless Chrome's `--virtual-time-budget` doesn't advance CSS
animations, so screenshot in real time over the DevTools protocol, or check with reduced motion forced.

## 7. Report

Summarize: route + header used, components reused vs. created, tokens added, deviations from the design (and
why), anything left as TODO. Then run the `code-review` skill on your diff.
