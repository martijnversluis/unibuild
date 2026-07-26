import Asset from './asset';
import BuildStages from './build_stages';
import { CommandExecutor } from './types/command_executor';
import Config from './config';
import Logger from './logger';
import cmd from './cmd';

export interface BuildOptions {
  force: boolean;
  parallel: boolean;
  release: boolean;
}

class Builder {
  commandExecutor: CommandExecutor;

  config: Config;

  logger: Logger;

  get assets() {
    return this.config.assets;
  }

  get linters() {
    return this.config.linters;
  }

  get testers() {
    return this.config.testers;
  }

  get preflightConfig() {
    return this.config.preflightConfig;
  }

  constructor(config: Config, commandExecutor?: CommandExecutor, logger?: Logger) {
    this.config = config;
    this.commandExecutor = commandExecutor || cmd;
    this.logger = logger || new Logger();
  }

  build(assetNames: string[], options: Partial<BuildOptions>): void {
    const requestedAssets = this.selectAssets(assetNames, options);
    const assetsThatNeedBuild = this.filterAssets(requestedAssets, options);
    const builtAssetsWithDependencies = this.addDependencies(assetsThatNeedBuild);
    const buildStages = new BuildStages(builtAssetsWithDependencies);

    this.logger.log(`Build ${builtAssetsWithDependencies.length} assets`, ['yellow']);

    buildStages.grouping.forEach((group, index) => {
      this.logger.section(`Stage ${index + 1}`, () => {
        group.forEach((name) => {
          const asset = this.assets[name];
          this.buildAsset(asset, options);
        });
      });
    });
  }

  lint({ fix }: { fix: boolean }) {
    this.logger.section('Linting...', () => {
      Object.values(this.linters).forEach((linter) => {
        this.logger.section(`Linter ${linter.name}`, () => {
          if (linter.requires.length > 0) {
            this.logger.section('Building required assets...', () => {
              this.build(
                linter.requires.map((asset) => asset.name),
                { force: false, parallel: false, release: true },
              );
            });
          }

          const command = (fix && linter.autofixCommand) ? linter.autofixCommand : linter.command;
          this.logger.log(`Running linter command: ${command}`, ['yellow']);
          this.commandExecutor(command);
          this.logger.log(`Done running linter ${linter.name}`, ['green']);
        });
      });
    });
  }

  test() {
    this.logger.section('Testing...', () => {
      Object.values(this.testers).forEach((tester) => {
        this.logger.section(`Tester ${tester.name}`, () => {
          if (tester.requires.length > 0) {
            this.logger.section('Building required assets...', () => {
              this.build(
                tester.requires.map((asset) => asset.name),
                { force: false, parallel: false, release: true },
              );
            });
          }

          this.logger.log(`Running test command: ${tester.command}`, ['yellow']);
          this.commandExecutor(tester.command);
          this.logger.log(`Done running tester ${tester.name}`, ['green']);
        });
      });
    });
  }

  clean(assetNames: string[]) {
    this.selectAssets(assetNames).forEach((asset: Asset) => {
      this.cleanAsset(asset);
    });
  }

  preflight() {
    const preflight = this.preflightConfig;

    if (!preflight.hasChecks()) {
      this.logger.log('No preflight checks configured, skipping', ['yellow']);
      return;
    }

    this.logger.section('Preflight checks...', () => {
      if (preflight.gitClean) this.checkGitClean();
      if (preflight.gitInSyncWithBaseBranch) this.checkGitInSyncWithBaseBranch();
      if (preflight.npmAuth) this.checkNpmAuth();
    });
  }

  private checkGitClean() {
    this.logger.log('Checking git working tree is clean', ['yellow']);
    this.commandExecutor('test -z "$(git status --porcelain)"');
    this.logger.log('Working tree is clean', ['green']);
  }

  private checkGitInSyncWithBaseBranch() {
    this.logger.log('Checking HEAD is not behind the base branch', ['yellow']);
    this.commandExecutor(
      'BASE=$(git rev-parse --abbrev-ref origin/HEAD) && ' +
      // eslint-disable-next-line no-template-curly-in-string
      'git fetch --quiet origin "${BASE#origin/}" && ' +
      'git merge-base --is-ancestor "$BASE" HEAD',
    );
    this.logger.log('HEAD is in sync with the base branch', ['green']);
  }

  private checkNpmAuth() {
    this.logger.log('Checking npm auth', ['yellow']);
    this.commandExecutor('yarn npm whoami');
    this.logger.log('npm auth OK', ['green']);
  }

  bump(version: string) {
    this.logger.log(`Bumping version to ${version}`, ['yellow']);
    this.commandExecutor(`npm version ${version}`);
    this.logger.log(`Done bumping version to ${version}`, ['green']);
  }

  gitPush() {
    this.logger.log('Pushing commit and tag to git', ['yellow']);
    this.commandExecutor('git push && git push --tags');
    this.logger.log('Done pushing to git', ['green']);
  }

  publish() {
    this.logger.log('Publishing to npm', ['yellow']);
    this.commandExecutor('yarn npm publish');
    this.logger.log('Done publishing to npm', ['green']);
  }

  private filterAssets(assets: Asset[], options: Partial<BuildOptions>): Asset[] {
    if (options.force) return assets;

    return assets.filter((asset) => asset.needsBuilding(options));
  }

  private addDependencies(assets: Asset[]): Asset[] {
    let allAssets = new Set<Asset>();

    assets.forEach((asset) => {
      allAssets.add(asset);

      asset.input.forEach((input) => {
        if (input.needsRebuild()) {
          allAssets = new Set([
            ...allAssets,
            ...this.addDependencies([input as Asset]),
          ]);
        }
      });
    });

    return Array.from(allAssets);
  }

  private selectAssets(assetNames: string[], options?: Partial<BuildOptions>) {
    const buildOptions = { release: true, ...options };

    if (assetNames.length === 0) {
      return Object
        .values(this.assets)
        .filter((asset) => buildOptions.release || !asset.releaseOnly);
    }

    return assetNames.map((name) => {
      const asset = this.assets[name];

      if (!asset) {
        throw new Error(`No such asset: ${name}`);
      }

      return asset;
    });
  }

  private buildAsset(asset: Asset, options: Partial<BuildOptions>) {
    this.logger.log(`Building ${asset.name}`, ['yellow']);

    this.logger.indent(() => {
      if (asset.buildFunction) {
        const inputs = this.logger.section('Reading inputs...', () => asset.input.map((input) => {
          if (input.isFile()) {
            this.logger.log(`Reading ${input.path}`);
            return input.read();
          }

          this.logger.log(`Input ${input.path} is not a file, returning the path`, ['yellow']);
          return input.path;
        }));

        const output = asset.buildFunction(options, ...inputs);
        this.logger.log(`Writing <${output}> to  ${asset.outfile.path}`);
        asset.outfile.write(output);
        this.logger.log(`Done building ${asset.name}`, ['green']);
      }

      if (asset.command) {
        this.logger.log(`Running command: ${asset.command}`, ['yellow']);
        this.commandExecutor(asset.command);
        this.logger.log(`Done building ${asset.name}`, ['green']);
      }
    });
  }

  private cleanAsset(asset: Asset) {
    this.logger.log(`Cleaning ${asset.name}`, ['yellow']);

    if (asset.outfile.exists()) {
      this.logger.log(`Removing ${asset.outfile.path}`);
      asset.outfile.remove();
      this.logger.log(`Done cleaning ${asset.name}`, ['green']);
    } else {
      this.logger.log(`File ${asset.outfile.path} not found`, ['yellow']);
    }
  }
}

export default Builder;
