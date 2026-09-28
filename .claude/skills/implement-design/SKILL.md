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
   screen's HTML and screenshot.
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
| `#FAF7F2` / ivory background | `var(--color-bg)`                             |
| `#FFFFFF` card               | `var(--color-surface)`                        |
| `#1C1B1F` text               | `var(--color-text)`                           |
| `#6B6770` secondary text     | `var(--color-muted)`                          |
| `#E8E3DC` borders            | `var(--color-border)`                         |
| `#1F3A93` buttons/links      | `var(--color-accent)`                         |
| red price / sale             | `var(--color-sale)`                           |
| silver / gold details        | `var(--color-silver)` / `var(--color-gold)`   |
| 4/8/12/16/24/32/48/64 px     | `var(--space-1…8)`                            |
| 6 / 12 / pill radius         | `var(--radius-sm / md / pill)`                |
| Serif headings               | `@include heading(2xl / xl / lg)`             |
| 12/14/16/20/24/32 text       | `@include text(xs / sm / md / lg / xl / 2xl)` |
| Uppercase tracked label      | `@include eyebrow`                            |

If a value doesn't map (e.g. a new brand color or an 18px gap), **don't invent a one-off**: either round to
the nearest token or add a new token to `styles/base/_tokens.scss` and say so in the summary.

## 4. Build

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

## 5. Verify

```bash
npm run check && npm run build
```

Then compare against the design at **390px and 1440px** (Playwright/Chrome screenshot or the in-app browser):
spacing rhythm, type scale, alignment, header variant, sticky bars not covering content, tap targets ≥ 44px,
keyboard focus visible, no horizontal scroll.

## 6. Report

Summarize: route + header used, components reused vs. created, tokens added, deviations from the design (and
why), anything left as TODO. Then run the `code-review` skill on your diff.
