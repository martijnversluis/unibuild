import chalk from 'chalk';
import { execSync } from 'child_process';
import Asset from './asset';
import Logger from './logger';
import BuildStages from './build_stages';
import DependencyGraph from './dependency_graph';
import AssetInput from './asset_input';
import Config from './config';
import BuildOptions from './build_options';

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
      const assetColor = this.assetColor(asset, { release: false });
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

  build(options: BuildOptions) {
    Object.values(this.assets).forEach((asset: Asset) => {
      this.buildAsset(asset, options);
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

          this.logger.log('Triggering build function...');
          const output = asset.buildFunction(...inputs);
          this.logger.log(`Writing to ${asset.outfile.path}`);
          asset.outfile.write(output);
          this.logger.log(`Done building ${asset.name}`, ['green']);
        } else if (asset.command) {
          this.logger.log(`Running command: ${asset.command}`, ['yellow']);
          execSync(asset.command, { stdio: 'inherit' });
          this.logger.log(`Done building ${asset.name}`, ['green']);
        }
      });
    } else {
      this.logger.log(`Asset ${asset.name} - up to date`, ['reset']);
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
