# Agent Instructions

See [README.md](./README.md) for the project overview, scripts, and testing procedure.

## Branching

Work on whichever branch is currently checked out, and never create a new branch unless told to.

`main` is the live website. Never push to `main` until the user has reviewed the commits and given permission. Commit locally in the meantime.

On any other branch, push each commit immediately.

## Code comments

Inline comments are a code smell. Resist the urge to fill the codebase with them. Favor self-documenting code: clear names, small functions, and well-named constants. When code needs a comment to be understood, first consider refactoring it for clarity — a comment shouldn't paper over a bad design.

Inline comments are still acceptable when the code is genuinely complex, or when they provide meaningful context the code can't express on its own (e.g. a browser quirk, a workaround, or the reason a non-obvious choice was made).

## Before calling a change done

1. Re-read your diff for comments and delete any that don't meet the bar in [Code comments](#code-comments).
2. `npm run tidy` — auto-fix lint violations and auto-format. Reports errors it can't fix.
3. `npm run build` — type-check and build.

## Testing changes

Verify UI/content changes in the browser (`claude-in-chrome` tools) before calling them done.

### Set up before editing code

If the task will need browser testing, set up the test environment **before any code edit**:

1. Run `powershell -File scripts/start-test-env.ps1`. It gets Chrome and the dev server running, configured so the tab keeps rendering when other windows cover it. Don't ask the user to launch Chrome. Don't minimize the window.
2. `tabs_context_mcp` / `tabs_create_mcp`, then navigate to `http://localhost:4321`.
3. Select the tab. New tabs open in the background, where `document.hidden` is `true` and `ResizeObserver`, `requestAnimationFrame` and CSS transitions are paused.
   1. Stamp a unique title with the JS tool: `document.title = 'mcp-tab-<tabId>'`.
   2. Run `powershell -File scripts/select-chrome-tab.ps1 -Title mcp-tab-<tabId>`.
   3. Reload the page to restore the real title.
   4. Confirm `document.hidden === false`.
4. Only if step 3 fails, ask the user to click the tab now, before starting the code work, so they can step away.

### Checking the change

1. Load `localhost:4321`.
2. Check rendering, console, and interactions.

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

Run `scripts/start-test-env.ps1` yourself — see step 1 of [Set up before editing code](#set-up-before-editing-code).

### A resize/animation/timer-dependent check silently does nothing

**Cause:** the tab isn't selected in Chrome's tab strip. New tabs from `tabs_context_mcp`/`tabs_create_mcp` open in the background; a non-selected tab has `document.hidden = true`, which pauses `ResizeObserver`, `requestAnimationFrame`, and CSS transitions.

**Unaffected:** screenshots, clicks, JS exec, DOM reads, and the pure CSS `@media` checks in [Testing responsive/mobile layouts](#testing-responsivemobile-layouts).

**Fix:** confirm with `document.hidden` (JS tool). Re-run the tab selection from step 3 of [Set up before editing code](#set-up-before-editing-code) — the tab loses selection if the user switches tabs. Only if that fails, ask the user to click the tab in Chrome's tab strip.
