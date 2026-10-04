import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const maxWidth = 960;
const warnBytes = 3 * 1024 * 1024;
const usage =
  'Usage: node tools/convert-loop.mjs <input> <output-path-without-extension> [--start s] [--duration s]';

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
      start: { type: 'string' },
      duration: { type: 'string' },
    },
  });

  if (positional.length !== 2) {
    throw new Error(usage);
  }

  const input = resolve(positional[0]);
  const base = resolve(positional[1]);
  const ffmpeg = loadFfmpeg();
  const trim = [
    ...(options.start ? ['-ss', options.start] : []),
    ...(options.duration ? ['-t', options.duration] : []),
  ];
  const scale = `scale='min(${maxWidth},iw)':-2`;

  mkdirSync(dirname(base), { recursive: true });

  // ffmpeg options reference: https://ffmpeg.org/ffmpeg.html#Options
  // H.264 encoding guide (crf, preset, profile, faststart): https://trac.ffmpeg.org/wiki/Encode/H.264
  run(ffmpeg, [
    ...trim,
    '-i',
    input,
    '-vf',
    scale,
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-crf',
    '26',
    '-preset',
    'slow',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-an',
    `${base}.mp4`,
  ]);
  run(ffmpeg, [
    ...trim,
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

  if (mp4Size > warnBytes) {
    console.warn('Warning: MP4 is over 3 MB. Trim the clip or shorten it.');
  }
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
