#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const binPath = resolve(__dirname, 'unibuild.ts');

const child = spawn('tsx', [binPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

child.on('error', (err) => {
  console.error('Failed to run unibuild:\n', err);
});

child.on('exit', (code) => process.exit(code ?? 1));
