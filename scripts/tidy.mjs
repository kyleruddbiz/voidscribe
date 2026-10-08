import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import {
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const eslintExtensions = new Set(['.js', '.mjs', '.ts', '.astro', '.svelte']);
const stylelintExtensions = new Set(['.css', '.svelte', '.astro']);

const readHookPath = () => {
  try {
    return JSON.parse(readFileSync(0, 'utf8')).tool_input?.file_path;
  } catch {
    // No hook payload on stdin; nothing to tidy.
    return undefined;
  }
};

const isInsideRepo = (path) => {
  const relativePath = relative(repoRoot, path);

  return (
    relativePath !== '' &&
    !relativePath.startsWith('..') &&
    !isAbsolute(relativePath)
  );
};

const run = (tool, args) => {
  try {
    execFileSync('npx', ['--no-install', tool, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return undefined;
  } catch (error) {
    return `${tool} failed:\n${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
};

const rawPaths =
  process.argv.length > 2 ? process.argv.slice(2) : [readHookPath()];
const paths = rawPaths
  .filter(Boolean)
  .map((path) => resolve(repoRoot, path))
  .filter((path) => isInsideRepo(path) && existsSync(path))
  .filter(
    (path) => !relative(repoRoot, path).split(sep).includes('node_modules'),
  );

const failures = [];

for (const path of paths) {
  const extension = extname(path);
  const file = relative(repoRoot, path);

  if (eslintExtensions.has(extension)) {
    failures.push(run('eslint', ['--fix', '--no-warn-ignored', file]));
  }

  if (stylelintExtensions.has(extension)) {
    failures.push(run('stylelint', ['--fix', file]));
  }

  failures.push(run('prettier', ['--write', '--ignore-unknown', file]));
}

const messages = failures.filter(Boolean);

if (messages.length > 0) {
  console.error(messages.join('\n'));
  process.exit(2);
}
