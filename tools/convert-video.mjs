import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const maxWidth = 1920;
// Cloudflare Pages and Workers static assets reject files over 25 MiB.
const cloudflareMaxFileBytes = 25 * 1024 * 1024;
const usage =
  'Usage: node tools/convert-video.mjs <input> <output-path-without-extension> [--poster-at s] [--crf n]';

const loadFfmpeg = () => {
  try {
    return createRequire(import.meta.url)('ffmpeg-static');
  } catch {
    throw new Error(
      'ffmpeg-static is missing. Run `npm --prefix tools install`.',
    );
  }
};

const run = (ffmpeg, args) => {
  const result = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', ...args], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed: ${args.join(' ')}`);
  }
};

const getFileSize = (path) => statSync(path).size;

const formatSize = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

const main = () => {
  const { positionals: positional, values: options } = parseArgs({
    allowPositionals: true,
    options: {
      'poster-at': { type: 'string', default: '0' },
      crf: { type: 'string', default: '26' },
    },
  });

  if (positional.length !== 2) {
    throw new Error(usage);
  }

  const input = resolve(positional[0]);
  const base = resolve(positional[1]);
  const ffmpeg = loadFfmpeg();
  const scale = `scale='min(${maxWidth},iw)':-2`;

  mkdirSync(dirname(base), { recursive: true });

  // ffmpeg options reference: https://ffmpeg.org/ffmpeg.html#Options
  // H.264 encoding guide (crf, preset, profile, faststart): https://trac.ffmpeg.org/wiki/Encode/H.264
  run(ffmpeg, [
    '-i',
    input,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0',
    '-vf',
    scale,
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-crf',
    options.crf,
    '-preset',
    'slow',
    '-g',
    '150',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    `${base}.mp4`,
  ]);
  run(ffmpeg, [
    '-ss',
    options['poster-at'],
    '-i',
    input,
    '-vf',
    scale,
    '-frames:v',
    '1',
    '-q:v',
    '3',
    `${base}.jpg`,
  ]);

  const mp4Size = getFileSize(`${base}.mp4`);
  const jpgSize = getFileSize(`${base}.jpg`);

  console.log(`${base}.mp4  ${formatSize(mp4Size)}`);
  console.log(`${base}.jpg  ${formatSize(jpgSize)}`);

  if (mp4Size > cloudflareMaxFileBytes) {
    throw new Error(
      'MP4 is over 25 MiB, which Cloudflare rejects. Raise the CRF or scale down to 1280 wide.',
    );
  }
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
