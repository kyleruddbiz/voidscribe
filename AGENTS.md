# Agent Instructions

See [README.md](./README.md) for the project overview, scripts, and testing procedure.

## Branching

Trunk-based development. Commit directly to `main` unless told otherwise.

Push every commit immediately after making it.

Single-commit task: review the change with the user before committing.

Multi-commit task: commit and push each commit as you go, without pausing for review in between. The user reviews everything at the end.

## Before calling a change done

1. `npm run format` — auto-format the diff (sub-second; safe to run every time).
2. `npm run build` — type-check and build.

## Testing changes

Verify UI/content changes in the browser (`claude-in-chrome` tools) before calling them done:

1. Start the dev server.
2. Load `localhost:4321`.
3. Check rendering, console, and interactions.

Leave the dev server running and the browser tab open when you're done testing. Reuse the same tab for further checks. Close things down only if asked — see [If asked to close the browser down](#if-asked-to-close-the-browser-down).

This app is responsive — layouts differ between desktop and mobile. Changes to layout, spacing, or CSS are candidates for a mobile check; use judgment on whether a given change could plausibly affect narrow-viewport rendering. See [Testing responsive/mobile layouts](#testing-responsivemobile-layouts) below for how.

### Testing responsive/mobile layouts

`resize_window` can't reach mobile breakpoints (Chrome has a ~500px minimum width on Windows), and there's no device-emulation tool. Instead:

1. Find the target `@media` block in the component's own `<style>` block (e.g. `@media (max-width: 480px)` in `PortfolioItem.svelte`). Read it — don't improvise the declarations.
2. Use the JS tool to inject a `<style>` element with `!important` that copies those declarations exactly. Svelte-scoped rules carry a compiled-in class that beats a plain override without `!important`.
3. Remove the injected style and reload before finishing.

The same technique also tests width-dependent JS, like description truncation: set `max-width` on a single element instead of copying a media query. This depends on `ResizeObserver` firing — see [Troubleshooting](#troubleshooting) if it silently does nothing. Pure CSS layout checks (above) don't need this.

### If asked to close the browser down

1. Close tabs you opened: `tabs_close_mcp`.
2. Stop the dev server: `npx astro dev stop` (it's a detached daemon).
3. Close Chrome: `taskkill //IM chrome.exe` (Bash, **no** `/F` — force-killing triggers a "didn't shut down correctly" prompt on next launch). An error like "could not be terminated" is expected noise from other chromium processes; the window still closes, so don't verify or retry.

## Troubleshooting

### Browser tools report "not connected"

1. Launch Chrome yourself, don't ask the user to: `"/c/Program Files/Google/Chrome/Application/chrome.exe"` (Bash).
2. Wait a couple seconds, then retry `tabs_context_mcp`.

### A resize/animation/timer-dependent check silently does nothing

**Cause:** the tab isn't selected in Chrome's tab strip. New tabs from `tabs_context_mcp`/`tabs_create_mcp` open in the background; a non-selected tab has `document.hidden = true`, which pauses `ResizeObserver`, `requestAnimationFrame`, and CSS transitions.

**Unaffected:** screenshots, clicks, JS exec, DOM reads, and the pure CSS `@media` checks in [Testing responsive/mobile layouts](#testing-responsivemobile-layouts).

**Fix:** confirm with `document.hidden` (JS tool). No tool can select a tab — ask the user to click it in Chrome's tab strip.
