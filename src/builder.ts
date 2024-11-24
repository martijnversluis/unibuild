import Asset from './asset';
import Logger from './logger';
import BuildStages from './build_stages';
import AssetInput from './asset_input';
import Config from './config';
import cmd from './cmd';

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
                linter.requires.map(asset => asset.name),
                { force: false, parallel: false, release: true },
              );
            });
          }

          const command = fix && linter.autofixCommand ? linter.autofixCommand : linter.command;
          this.logger.log(`Running linter command: ${command}`, ['yellow']);
          cmd(command);
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
                tester.requires.map(asset => asset.name),
                { force: false, parallel: false, release: true },
              );
            });
          }

          this.logger.log(`Running test command: ${tester.command}`, ['yellow']);
          cmd(tester.command);
          this.logger.log(`Done running tester ${tester.name}`, ['green']);
        });
      });
    });
  }

  filterAssets(assets: Asset[], options: Partial<BuildOptions>): Asset[] {
    if (options.force) return assets;

    return assets.filter((asset) => {
      return asset.needsBuilding(options);
    });
  }

  addDependencies(assets: Asset[]): Asset[] {
    let allAssets : Set<Asset> = new Set();

    assets.forEach((asset) => {
      allAssets.add(asset);

      asset.input.forEach((input) => {
        if (input.needsRebuild()) {
          allAssets = new Set([
            ...allAssets,
            ...this.addDependencies([input as Asset])
          ]);
        }
      });
    });

    return Array.from(allAssets);
  }

  clean(assetNames: string[]) {
    this.selectAssets(assetNames).forEach((asset: Asset) => {
      this.cleanAsset(asset);
    });
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

  buildAsset(asset: Asset, options: Partial<BuildOptions>) {
    this.logger.log(`Building ${asset.name}`, ['yellow']);

    this.logger.indent(() => {
      if (asset.buildFunction) {
        const inputs = this.logger.section('Reading inputs...', () => asset.input.map((input) => {
          this.logger.log(`Reading ${input.path}`);
          return input.read();
        }));

        const output = asset.buildFunction(options, ...inputs);
        this.logger.log(`Writing to ${asset.outfile.path}`);
        asset.outfile.write(output);
        this.logger.log(`Done building ${asset.name}`, ['green']);
      }

      if (asset.command) {
        this.logger.log(`Running command: ${asset.command}`, ['yellow']);
        cmd(asset.command);
        this.logger.log(`Done building ${asset.name}`, ['green']);
      }
    });
  }

  cleanAsset(asset: Asset) {
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
