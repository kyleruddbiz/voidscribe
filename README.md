# Void Scribe Studios

Astro static site using Svelte for components.

## Getting started

```
npm install
npm run dev
```

Dev server: `http://localhost:4321`.

Copy `.env.example` to `.env` and set `ITCH_ACCESS_CODE` (URL-encoded). It's required — dev and build fail without it. Set the same value as a build variable in production.

## Scripts

- `npm run dev` / `npm run start` — start the dev server.
- `npm run build` — type-check and build for production.
- `npm run preview` — serve the production build locally.
- `npm run format` — format the repo with Prettier.
- `npm run format:check` — check formatting without writing changes.
- `npm run lint` — run ESLint and Stylelint.
- `npm run tidy` — auto-fix lint violations and format the repo.

## Content

Page content lives in `src/content/`:

- `site.ts` — strings shared site-wide (name, tagline).
- `<page>.ts` — content for one page, named after its route (`kyle-rudd.ts` for `/kyle-rudd`).
- `<page>/*.html` — markup too complex to inline in a content string, such as a multi-paragraph
  portfolio description. Import it with `?raw` (e.g. `import x from './kyle-rudd/x.html?raw'`) and
  use it as a value in the page's `.ts` file. Prettier formats these files, so `npm run format`
  will catch malformed markup.
- `<page>/<gallery>.ts` — image list for a gallery portfolio entry; its images live in a folder of
  the same name.

Portfolio `title` and `description` values are HTML strings, rendered with `{@html}`. That's safe
because the content is authored in this repo, but don't feed it anything user-supplied.

## Tools

Developer tooling lives in `tools/` with its own dependencies. See [tools/README.md](./tools/README.md).

## Workflow

See [AGENTS.md](./AGENTS.md) for the branching model and the checks to run before calling a change done.

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
