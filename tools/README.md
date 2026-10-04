# Tools

Developer tooling, kept separate from the site. `tools/` has its own `package.json`, so its
dependencies are never installed by the site's `npm install` or by deploy builds.

## Setup

```
npm --prefix tools install
```

This downloads a pinned ffmpeg binary (`ffmpeg-static`, ~80 MB) into `tools/node_modules/`, which is
git-ignored.

## Converting a clip for `LoopingVideo`

```
node tools/convert-loop.mjs <input> <output-path-without-extension> [--start s] [--duration s]
```

Example:

```
node tools/convert-loop.mjs "C:\Videos\clip.mp4" src/content/kyle-rudd/my-clip --start 3 --duration 8
```

It writes:

- `<name>.mp4` — H.264, silent, scaled to at most 960px wide, with `faststart`.
- `<name>.jpg` — the first frame at the same size, used as the poster.

It prints both sizes and warns if the MP4 is over ~3 MB.

### Guidelines

- Keep clips short (≲10 s), loop-friendly and silent.
- Put outputs next to the page's content in `src/content/<page>/`, with kebab-case names.
- Never commit the source videos; only the encoded outputs.
- Import the video with `?url` and the poster as an image, then pass both to `buildLoopingVideo`
  (`src/lib/looping-video.ts`) and render the result with `LoopingVideo.svelte`.
