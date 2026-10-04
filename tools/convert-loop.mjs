import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

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

const parseArgs = (argv) => {
  const positional = [];
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      options[argv[i].slice(2)] = argv[(i += 1)];
    } else {
      positional.push(argv[i]);
    }
  }

  return { positional, options };
};

const run = (ffmpeg, args) => {
  const result = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', ...args], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed: ${args.join(' ')}`);
  }
};

const formatSize = (path) => {
  const { size } = statSync(path);

  return { size, label: `${(size / 1024).toFixed(0)} KB` };
};

const main = () => {
  const { positional, options } = parseArgs(process.argv.slice(2));

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

  const mp4 = formatSize(`${base}.mp4`);
  const jpg = formatSize(`${base}.jpg`);

  console.log(`${base}.mp4  ${mp4.label}`);
  console.log(`${base}.jpg  ${jpg.label}`);

  if (mp4.size > warnBytes) {
    console.warn('Warning: MP4 is over 3 MB. Trim the clip or shorten it.');
  }
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
