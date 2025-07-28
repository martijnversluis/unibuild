#!/usr/bin/env tsx

import CLI from '../src/cli';
import Config from '../src/config';

import { existsSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const configFilenames = ['unibuild.ts', 'unibuild.js'];

function getConfigFilePath(): string {
  const cwd = process.cwd();

  for (const filename of configFilenames) { //  eslint-disable-line no-restricted-syntax
    const fullPath = resolve(cwd, filename);
    if (existsSync(fullPath)) {
      return pathToFileURL(fullPath).href;
    }
  }

  throw new Error(`No unibuild config file found (${configFilenames.join(', ')})`);
}

async function findAndLoadConfig(): Promise<Config> {
  const filepath = getConfigFilePath();
  const configModule = await import(filepath);
  return configModule.default;
}

(async () => {
  try {
    const config = await findAndLoadConfig();
    new CLI(config).run();
  } catch (err) {
    console.error('[unibuild] Error:', err);
    process.exit(1);
  }
})();
