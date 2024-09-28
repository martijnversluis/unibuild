#!/usr/bin/env node

import * as fs from 'fs';
import process from 'process';
import { Command } from 'commander';
import { ModuleImporter } from '@humanwhocodes/module-importer';

import Builder from './builder';
import Config from './config';

const importer = new ModuleImporter();

class CLI {
  builder: Builder | null = null;

  config: Config | null = null;

  async run() {
    this.config = await this.loadConfig();
    this.builder = new Builder(this.config);
    this.program.parse();
  }

  async loadConfig(): Promise<Config> {
    const configFilePath = `${process.cwd()}/unibuild.config.js`;
    const config = await importer.import(configFilePath) as Config;

    if (!fs.existsSync(configFilePath)) {
      throw new Error(`Config file not found: ${configFilePath}`);
    }

    if (!('default' in config)) {
      throw new Error('Config file must export a default object');
    }

    return config.default as Config;
  }

  get program(): Command {
    const program = new Command();

    const build = () => {
      this.builder?.build({
        release: program.opts().release,
      });
    };

    program
      .name('builder')
      .option('--release', 'Build for release')
      .description('The simplest build tool in the universe')
      .version('0.0.1');

    program
      .command('build', { isDefault: true })
      .description('Build assets')
      .argument('[assets...]', 'asset(s) to build')
      .option('--release', 'Build for release')
      .action(build);

    return program;
  }
}

new CLI()
  .run()
  .catch((error) => console.error(error));
