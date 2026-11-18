#!/usr/bin/env node
/**
 * Cross-platform audio generator entrypoint (macOS + Windows).
 * Prefer the Python Edge-TTS pipeline; never use macOS-only `say`.
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const script = join(__dirname, 'generateListeningAudio.py');

/** @type {Array<[string, ...string[]]>} */
const candidates =
  process.platform === 'win32'
    ? [
        ['py', '-3'],
        ['py'],
        ['python'],
        ['python3'],
      ]
    : [
        ['python3'],
        ['python'],
      ];

for (const [cmd, ...prefixArgs] of candidates) {
  const probe = spawnSync(cmd, [...prefixArgs, '--version'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (probe.status === 0) {
    const result = spawnSync(cmd, [...prefixArgs, script], {
      stdio: 'inherit',
      windowsHide: true,
    });
    process.exit(result.status ?? 1);
  }
}

console.error(
  'Python was not found. Install Python 3, then run:\n' +
    '  pip install edge-tts\n' +
    '  npm run generate:audio\n' +
    'On Windows, install from python.org (not the Store stub) and ensure "py" or "python" is on PATH.'
);
process.exit(1);
