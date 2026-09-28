# Zardakhsha: Georgian Enamel Atelier

Mobile-first online shop for handmade enamel jewelry. Next.js 16 · React 19 · SCSS Modules · MongoDB/Mongoose · Better Auth (Google).

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in MongoDB + Google + auth secret
npm run seed                    # demo products and reviews
npm run dev                     # http://localhost:3000
```

Google sign-in: in Google Cloud Console create an OAuth client (Web) with redirect URI
`http://localhost:3000/api/auth/callback/google`.

## Scripts

| Script           | What it does                        |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Dev server (Turbopack)              |
| `npm run check`  | Typecheck + ESLint + Prettier check |
| `npm run build`  | Production build                    |
| `npm run seed`   | Reset demo catalog                  |
| `npm run format` | Format everything with Prettier     |

## Working with Claude Code

- `CLAUDE.md`: architecture, folder structure, navigation contract, React/SCSS rules
- `.claude/skills/implement-design`: how to turn a Stitch/Figma screen into code
- `.claude/skills/code-review`: review checklist to run before committing
- `.mcp.json`: Stitch + Figma MCP servers. Set `STITCH_API_KEY` in your shell environment first.

## Screens

| Route                           | Header | Status                                         |
| ------------------------------- | ------ | ---------------------------------------------- |
| `/`                             | A      | Built (hero, categories, bento, bestsellers…)  |
| `/shop/[slug]`                  | A      | Built (filters in URL, sort, grid + editorial) |
| `/search`                       | A      | Built                                          |
| `/account`                      | A      | Built                                          |
| `/product/[slug]`               | B      | Built (gallery, variants, sticky add to bag)   |
| `/product/[slug]/reviews`       | B      | Built (summary, filters, write review)         |
| `/bag`                          | B      | Built (optimistic quantity, free-ship bar)     |
| `/login`                        | B      | Built (Google + guest)                         |
| `/account/orders`, `/addresses` | B      | Built                                          |
| `/checkout`                     | C      | Built (payment provider TODO)                  |
| `/order/[number]`               | C      | Built                                          |
| Admin panel                     | n/a    | Phase 2                                        |
