# VoidScribe Studios

Astro static site.

## Getting started

```
npm install
npm run dev
```

Dev server: `http://localhost:4321`.

Copy `.env.example` to `.env` and set `ITCH_ACCESS_CODE` (URL-encoded — e.g. `encodeURIComponent(value)`) to fully render the MTG Simulator portfolio link. Without it, the link still builds but points to the unlocked base itch.io URL. Use the same encoded value for the `ITCH_ACCESS_CODE` build variable in Cloudflare Pages.

## Scripts

- `npm run dev` / `npm run start` — start the dev server.
- `npm run build` — type-check (`astro check`) and build for production.
- `npm run preview` — serve the production build locally.

## Testing changes

No automated tests. Check changes by hand in a browser:

1. `npm run dev`, then open the changed page(s) at `localhost:4321`.
2. Confirm it renders correctly, check the console for errors, and exercise any affected interactive elements (nav, links, forms).
3. For layout/styling changes, check both desktop and mobile widths.

A passing build just means the types are correct, not that the page looks or works right.
