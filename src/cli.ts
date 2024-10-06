import { Command } from 'commander';
import * as packageInfo from '../package.json';

import Builder from './builder';
import Config from './config';

class CLI {
  builder: Builder;

  config: Config;

  constructor(config: Config) {
    this.config = config;
    this.builder = new Builder(this.config);
  }

  run() {
    this.program.parse();
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
      .description(packageInfo.description)
      .version(packageInfo.version);

    program
      .command('build', { isDefault: true })
      .description('Build assets')
      .argument('[assets...]', 'asset(s) to build')
      .option('--release', 'Build for release')
      .action(build);

    return program;
  }
}

export default CLI;
