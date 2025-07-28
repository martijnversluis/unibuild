import { Command } from 'commander';
import * as packageInfo from '../package.json';

import Builder from './builder';
import Config from './config';

class CLI {
  builder: Builder;

  config: Config;

  program: Command;

  constructor(config: Config) {
    console.log('Config:', config);
    this.config = config;
    this.builder = new Builder(this.config);
    this.program = this.buildProgram();
  }

  async run() {
    await this.program.parseAsync();
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

    program
      .command('ci')
      .description('Build, lint, test and build release')
      .action(this.ci.bind(this));

    program
      .command('bump')
      .description('Bump version')
      .argument('<version>', 'Version to bump to')
      .action(this.bump.bind(this));

    program
      .command('publish')
      .description('Publish release')
      .action(this.publish.bind(this));

    program
      .command('release')
      .description('Build, lint, test, build release and publish')
      .argument('<version>', 'Version to bump to')
      .action(this.release.bind(this));

    return program;
  }

  async build(assetNames: string[], { force, release }: { force?: boolean, release?: boolean }) {
    await this.builder.build(
      assetNames,
      {
        force: force || false,
        release: release || false,
        parallel: true,
      },
    );
  }

  async clean(assetNames: string[]) {
    await this.builder.clean(assetNames);
  }

  async lint({ fix }: { fix?: boolean }) {
    await this.builder.lint({
      fix: fix || false,
    });
  }

  async test() {
    await this.builder.test();
  }

  async ci() {
    await this.build([], { release: false });
    await this.lint({ fix: false });
    await this.test();
    await this.build([], { release: true });
  }

  async bump(version: string) {
    await this.builder.bump(version);
  }

  async publish() {
    await this.builder.publish();
  }

  async gitPush() {
    await this.builder.gitPush();
  }

  async release(version: string) {
    await this.build([], { release: false });
    await this.lint({ fix: false });
    await this.test();
    await this.build([], { force: true, release: true });
    await this.bump(version);
    await this.gitPush();
    await this.publish();
  }
}

export default CLI;
