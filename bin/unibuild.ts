#!/usr/bin/env tsx

import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { existsSync } from 'fs';
import CLI from '../src/cli';
import Config from "../src/config";

const configFilenames = ['unibuild.ts', 'unibuild.js'];

async function findAndLoadConfig(): Promise<Config> {
  const cwd = process.cwd();
  for (const filename of configFilenames) {
    const fullPath = resolve(cwd, filename);
    if (existsSync(fullPath)) {
      const fileURL = pathToFileURL(fullPath).href;
      console.log('Importing: ', fileURL);
      const configModule = await import(fileURL);
      return configModule.default;
    }
  }
  throw new Error(`No unibuild config file found (${configFilenames.join(', ')})`);
}

(async () => {
  try {
    const config = await findAndLoadConfig();
    await new CLI(config).run();
  } catch (err) {
    console.error('[unibuild] Error:', err);
    process.exit(1);
  }
})();
