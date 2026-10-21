# Void Scribe Studios

Astro static site using Svelte for components.

## Getting started

```
sh scripts/setup.sh
npm run dev
```

`scripts/setup.sh` is the one-time setup: it installs the Node version in `.node-version` and the npm dependencies, and creates `.env`. Add any future one-time installs to it.

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

A Claude Code hook runs `scripts/tidy.mjs` on every edited file, so agent edits are tidied like VS Code’s format-on-save.

## Content

Page content lives in `src/content/`:

- `site/` — content shared site-wide: `index.ts` (name, social name) and `landing-slugs.ts`.
- `<page>/index.ts` — assembles the content for one page, named after its route (`kyle-rudd/` for
  `/kyle-rudd`).
- `<page>/bio/` — Svelte components holding the profile and role bios.
- `<page>/roles/` — the roles (`index.ts`) plus any media they use.
- `<page>/portfolio/` — `index.ts` lists the entries in display order. Each entry has its own
  folder holding `index.ts` (the entry), `preview.jpg`, `description.svelte` when the
  description is too complex to inline in a content string, and `details.astro` for the full
  page content of entries that have a page: plain HTML mixed with the shared `PageImage` and
  `PageVideo` components. The folder name must equal the entry’s `page.slug`. Gallery entries keep their images in the same
  folder.

Portfolio `title` and `description` values are HTML strings, rendered with `{@html}`. That's safe
because the content is authored in this repo, but don't feed it anything user-supplied.

## Tools

Developer tooling lives in `tools/` with its own dependencies. See [tools/README.md](./tools/README.md).

## Workflow

See [AGENTS.md](./AGENTS.md) for the branching model and the checks to run before calling a change done.

## Dependencies

TypeScript is pinned to `^6.0.3` rather than the latest major. Four packages cap their `typescript`
peer dependency below 7: `@astrojs/check` and `svelte-check` (`^5 || ^6`, both used by `npm run build`),
`@astrojs/svelte` (`^5.3.3 || ^6`) and `typescript-eslint` (`<6.1.0`). Upgrading to TypeScript 7 breaks
the build and lint until they all add support for it.

## Testing changes

No automated tests. Check changes by hand in a browser:

1. `npm run dev`, then open the changed page(s) at `localhost:4321`.
2. Confirm it renders correctly, check the console for errors, and exercise any affected interactive elements (nav, links, forms).
3. For layout/styling changes, check both desktop and mobile widths.

A passing build just means the types are correct, not that the page looks or works right.
