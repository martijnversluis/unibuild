import { Command } from 'commander';

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

export default CLI;
