# Tools

Developer tooling, kept separate from the site. `tools/` has its own `package.json`, so the site's
`npm install` and deploy builds never install its dependencies.

## Setup

```
npm --prefix tools install
```

## Converting a clip for `LoopingVideo`

```
node tools/convert-loop.mjs <input> <output-path-without-extension> [--start s] [--duration s]
```

Example:

```
node tools/convert-loop.mjs "C:\Videos\clip.mp4" src/content/kyle-rudd/my-clip --start 3 --duration 8
```

It writes `<name>.mp4` and a matching `<name>.jpg` poster (the clip's first frame).

### Guidelines

- Keep clips short, loop-friendly and silent.
- Put outputs next to the page's content in `src/content/<page>/`, with kebab-case names.
- Never commit the source videos; only the encoded outputs.
- Import the video with `?url` and the poster as an image, then pass both to `buildLoopingVideo`
  and render the result with `LoopingVideo.svelte`.
