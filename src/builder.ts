import Asset from './asset';
import Logger from './logger';
import BuildStages from './build_stages';
import Config from './config';
import cmd from './cmd';
import ora from 'ora';

export interface BuildOptions {
  force: boolean;
  parallel: boolean;
  release: boolean;
}

class Builder {
  config: Config;

  logger: Logger = new Logger();

  get assets() {
    return this.config.assets;
  }

  get linters() {
    return this.config.linters;
  }

  get testers() {
    return this.config.testers;
  }

  constructor(config: Config) {
    this.config = config;
  }

  async build(assetNames: string[], options: BuildOptions): Promise<void> {
    const requestedAssets = this.selectAssets(assetNames, options);
    const assetsThatNeedBuild = await this.filterAssets(requestedAssets, options);
    const builtAssetsWithDependencies = await this.addDependencies(assetsThatNeedBuild);
    const buildStages = new BuildStages(builtAssetsWithDependencies);

    this.logger.log(`Build ${builtAssetsWithDependencies.length} assets`, ['yellow']);

    for (const group of buildStages.grouping) {
      const tasks = group.map(async (name) => {
        const spinner = ora(name).start(name);
        try {
          await this.buildAsset(this.assets[name], options);
          spinner.succeed();
        } catch (error) {
          spinner.fail(`Failed to build ${name}: ${error}`);
        }
      });

      if (options.parallel) {
        await Promise.all(tasks);
      } else {
        for (const task of tasks) {
          await task;
        }
      }
    }
  }

  async lint({ fix }: { fix: boolean }) {
    this.logger.section('Linting...', () => {
      Object.values(this.linters).forEach((linter) => {
        this.logger.section(`Linter ${linter.name}`, async () => {
          if (linter.requires.length > 0) {
            this.logger.section('Building required assets...', () => {
              this.build(
                linter.requires.map(asset => asset.name),
                { force: false, parallel: false, release: true },
              );
            });
          }

          const command = fix && linter.autofixCommand ? linter.autofixCommand : linter.command;
          this.logger.log(`Running linter command: ${command}`, ['yellow']);
          const _output = await cmd(command);
          this.logger.log(`Done running linter ${linter.name}`, ['green']);
        });
      });
    });
  }

  async test() {
    for (const tester of Object.values(this.testers)) {
      if (tester.requires.length > 0) {
        await this.build(
          tester.requires.map(asset => asset.name),
          { force: false, parallel: false, release: true },
        );
      }

      this.logger.log(`Running test command: ${tester.command}`, ['yellow']);
      await cmd(tester.command);
      this.logger.log(`Done running tester ${tester.name}`, ['green']);
    }
  }

  async filterAssets(assets: Asset[], options: Partial<BuildOptions>): Promise<Asset[]> {
    if (options.force) return assets;

    const filteredAssets: Asset[] = [];

    for (const asset of assets) {
      if (await asset.needsBuilding(options)) {
        filteredAssets.push(asset);
      }
    }

    return filteredAssets;
  }

  async addDependencies(assets: Asset[]): Promise<Asset[]> {
    let allAssets : Set<Asset> = new Set();

    for (const asset of assets) {
      allAssets.add(asset);

      for (const input of asset.input) {
        if (await input.needsRebuild()) {
          allAssets = new Set([
            ...allAssets,
            ...(await this.addDependencies([input as Asset]))
          ]);
        }
      }
    }

    return Array.from(allAssets);
  }

  async clean(assetNames: string[]) {
    for (const asset of this.selectAssets(assetNames)) {
      await this.cleanAsset(asset);
    }
  }

  selectAssets(assetNames: string[], options?: Partial<BuildOptions>) {
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

  async buildAsset(asset: Asset, options: BuildOptions) {
    if (asset.buildFunction) {
      const inputs: string[] = await Promise.all(
        asset.input.map(async (input) => {
          if (await input.isFile()) {
            return input.read();
          }

          return input.path;
        })
      );

      const output = asset.buildFunction(options, ...inputs);
      await asset.outfile.write(output);
    }

    if (asset.command) {
      await cmd(asset.command);
    }
  }

  async cleanAsset(asset: Asset) {
    this.logger.log(`Cleaning ${asset.name}`, ['yellow']);

    if (await asset.outfile.exists()) {
      this.logger.log(`Removing ${asset.outfile.path}`);
      await asset.outfile.remove();
      this.logger.log(`Done cleaning ${asset.name}`, ['green']);
    } else {
      this.logger.log(`File ${asset.outfile.path} not found`, ['yellow']);
    }
  }

  async bump(version: string): Promise<void> {
    this.logger.log(`Bumping version to ${version}`, ['yellow']);
    await cmd(`npm version ${version}`);
    this.logger.log(`Done bumping version to ${version}`, ['green']);
  }

  async gitPush(): Promise<void> {
    this.logger.log('Pushing commit and tag to git', ['yellow']);
    await cmd('git push && git push --tags');
    this.logger.log('Done pushing to git', ['green']);
  }

  async publish(): Promise<void> {
    this.logger.log('Publishing to npm', ['yellow']);
    await cmd('yarn npm publish');
    this.logger.log('Done publishing to npm', ['green']);
  }
}

export default Builder;
