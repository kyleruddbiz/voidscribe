# Agent Instructions

See [README.md](./README.md) for the project overview, scripts, and testing procedure.

## Testing changes

Do the README's browser check yourself, using the `claude-in-chrome` tools: start the dev server, load `localhost:4321`, and verify rendering, console, and interactions.

Only call a UI or content change done after checking it in the browser this way.

## If the browser tools say "not connected"

A background `chrome.exe` process (updater, crash handler) isn't enough for the extension to attach — an actual Chrome window needs to be open. If `tabs_context_mcp` or `navigate` reports the extension as disconnected, launch Chrome yourself and retry before asking the user to intervene.
