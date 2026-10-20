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

## Converting a long video for `PageVideoPlayer`

```
node tools/convert-video.mjs <input> <output-path-without-extension> [--poster-at s]
```

Example:

```
node tools/convert-video.mjs "C:\Videos\walkthrough.mp4" src/content/kyle-rudd/hard-problems/walkthrough --poster-at 12
```

Use this instead of `convert-loop` for narrated or long videos that need sound and playback
controls. It keeps the audio (AAC, 96 kbps), encodes up to 1080p, and writes `<name>.mp4` plus a
`<name>.jpg` poster taken at `--poster-at` (default `0`).

- The tool fails if the MP4 is over 25 MiB, the per-file limit on Cloudflare Pages and Workers static
  assets. If that happens, raise the CRF or scale down to 1280 wide.
- There is no Git LFS. The committed MP4 stays under the limit, and the source video is never committed.
- If long videos become routine, host them on Cloudflare R2 or Stream instead.
