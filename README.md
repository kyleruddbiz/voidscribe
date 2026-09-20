# Void Scribe Studios

Astro static site using Svelte for components.

## Getting started

```
npm install
npm run dev
```

Dev server: `http://localhost:4321`.

Copy `.env.example` to `.env` and set `ITCH_ACCESS_CODE` (URL-encoded — e.g. `encodeURIComponent(value)`) to fully render the MTG Simulator portfolio link. Without it, the link still builds but points to the locked itch.io URL for the project. Use the same encoded value for the `ITCH_ACCESS_CODE` build variable in your hosting platform.

## Scripts

- `npm run dev` / `npm run start` — start the dev server.
- `npm run build` — type-check (`astro check`) and build for production.
- `npm run preview` — serve the production build locally.
- `npm run format` — format the repo with Prettier.
- `npm run format:check` — check formatting without writing changes.

## Content

Page content lives in `src/content/`:

- `site.ts` — strings shared site-wide (name, tagline).
- `<page>.ts` — content for one page, named after its route (`kyle-rudd.ts` for `/kyle-rudd`).

## Dependencies

TypeScript is pinned to `^6.0.3` rather than the latest major. Both type-checkers used by
`npm run build` — `@astrojs/check` and `svelte-check` — cap their `typescript` peer dependency at
`^5.0.0 || ^6.0.0`, so upgrading to TypeScript 7 breaks the build until they add support for it.

## Testing changes

No automated tests. Check changes by hand in a browser:

1. `npm run dev`, then open the changed page(s) at `localhost:4321`.
2. Confirm it renders correctly, check the console for errors, and exercise any affected interactive elements (nav, links, forms).
3. For layout/styling changes, check both desktop and mobile widths.

A passing build just means the types are correct, not that the page looks or works right.
