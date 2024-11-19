import Asset from './asset';
import AssetOptions from './asset_options';
import LinterOptions from "./linter_options";
import Linter from './linter';

class Config {
  assets: Record<string, Asset> = {};

  linters: Record<string, Linter> = {};

  constructor(callback: (config: Config) => void) {
    callback(this);
  }

  asset(name: string, options: AssetOptions): Asset {
    const asset = new Asset(name, options);
    this.assets[name] = asset;
    return asset;
  }

  lint(name: string, options: LinterOptions): Linter {
    const linter = new Linter(name, options);
    this.linters[name] = linter;
    return linter;
  }
}

export default Config;
