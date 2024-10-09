import { Command } from 'commander';
import * as packageInfo from '../package.json';

import Builder from './builder';
import Config from './config';

class CLI {
  builder: Builder;

  config: Config;

  program: Command;

  constructor(config: Config) {
    this.config = config;
    this.builder = new Builder(this.config);
    this.program = this.buildProgram();
  }

  run() {
    this.program.parse();
  }

  buildProgram(): Command {
    const program = new Command();

    program
      .name(packageInfo.name.split('/').pop() as string)
      .description(packageInfo.description)
      .version(packageInfo.version);

    program
      .command('build', { isDefault: true })
      .description('Build assets')
      .argument('[assets...]', 'asset(s) to build')
      .option('-f, --force', 'Force re-build')
      .option('-r, --release', 'Build for release')
      .action(this.build.bind(this));

    return program;
  }

  build(assetNames: string[])  {
    this.builder.build(
      assetNames,
      {
        force: this.program.opts().force,
        release: this.program.opts().release
      },
    );
  }
}

export default CLI;
