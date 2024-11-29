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

    program
      .command('lint')
      .description('Lint assets')
      .option('-f, --fix', 'Fix linting issues when possible')
      .action(this.lint.bind(this));

    program
      .command('test')
      .description('Run tests')
      .action(this.test.bind(this));

    program
      .command('clean')
      .description('Clean assets')
      .argument('[assets...]', 'asset(s) to build')
      .action(this.clean.bind(this));

    return program;
  }

  build(assetNames: string[], { force, release }: { force?: boolean, release?: boolean }) {
    this.builder.build(
      assetNames,
      {
        force: force || false,
        release: release || false,
      },
    );
  }

  clean(assetNames: string[]) {
    this.builder.clean(assetNames);
  }

  lint({ fix }: { fix?: boolean }) {
    this.builder.lint({
      fix: fix || false,
    });
  }

  test() {
    this.builder.test();
  }
}

export default CLI;
