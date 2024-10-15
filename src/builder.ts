import chalk from 'chalk';
import Asset from './asset';
import Logger from './logger';
import BuildStages from './build_stages';
import DependencyGraph from './dependency_graph';
import AssetInput from './asset_input';
import Config from './config';
import cmd from './cmd';

export interface BuildOptions {
  force: boolean;
  release: boolean;
}

class Builder {
  config: Config;

  logger: Logger = new Logger();

  get assets() {
    return this.config.assets;
  }

  constructor(config: Config) {
    this.config = config;
  }

  showDependencyTree() {
    console.log(
      new BuildStages(
        new DependencyGraph(
          Object.values(this.assets),
        ),
      ),
    );
  }

  status() {
    Object.values(this.assets).forEach((asset) => {
      const assetColor = this.assetColor(asset, { force: false, release: false });
      console.log(chalk[assetColor].underline.bold(`${asset.path}`));
      console.log('  inputs:');

      asset.input.forEach((input: AssetInput) => {
        const color = this.inputColor(input, asset);
        const text = (input instanceof Asset) ? `${chalk.bold(input.name)} [${input.path}]` : input.path;
        console.log(chalk[color](`    - ${text}`));
      });

      console.log(`  output: ${asset.outfile.path}`);
      console.log();
    });
  }

  build(assetNames: string[], options: BuildOptions) {
    this.selectAssets(assetNames).forEach((asset: Asset) => {
      this.buildAsset(asset, options);
    });
  }

  clean(assetNames: string[]) {
    this.selectAssets(assetNames).forEach((asset: Asset) => {
      this.cleanAsset(asset);
    });
  }

  selectAssets(assetNames: string[]) {
    if (assetNames.length === 0) {
      return Object.values(this.assets);
    }

    return assetNames.map((name) => {
      const asset = this.assets[name];

      if (!asset) {
        throw new Error(`No such asset: ${name}`);
      }

      return asset;
    });
  }

  buildAsset(asset: Asset, options: BuildOptions) {
    if (asset.needsBuilding(options)) {
      this.logger.log(`Building ${asset.name}`, ['yellow']);

      this.logger.indent(() => {
        this.logger.log('Building dependencies', ['yellow']);

        this.logger.indent(() => {
          asset.input.forEach((input: AssetInput) => {
            if (input instanceof Asset) {
              this.buildAsset(input, options);
            }
          });
        });

        this.logger.log('Done building dependencies', ['green']);
        this.logger.log(`Building ${asset.name}`, ['yellow']);

        if (asset.buildFunction) {
          const inputs = this.logger.section('Reading inputs...', () => asset.input.map((input) => {
            this.logger.log(`Reading ${input.path}`);
            return input.read();
          }));

          this.logger.log(
            `Triggering build function with ${JSON.stringify(options)} and Node env ${process.env.NODE_ENV}`
          );
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
    } else {
      this.logger.log(`Asset ${asset.name} - up to date`, ['reset']);
    }
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

  inputColor(input: AssetInput, asset: Asset) {
    if (input.exists() && !input.newerThan(asset)) {
      return 'reset';
    }

    if (!input.exists() && !input.canBeBuilt()) {
      return 'red';
    }

    return 'yellow';
  }

  assetColor(asset: Asset, options: BuildOptions) {
    if (asset.needsBuilding(options)) {
      return 'yellow';
    }

    return 'reset';
  }
}

export default Builder;
