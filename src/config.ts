import Asset from './asset';
import AssetOptions from './asset_options';
import LinterOptions from "./linter_options";
import Linter from './linter';
import TesterOptions from './tester_options';
import Tester from "./tester";

class Config {
  assets: Record<string, Asset> = {};

  linters: Record<string, Linter> = {};

  testers: Record<string, Tester> = {};

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

  test(name: string, options: TesterOptions): Tester {
    const tester = new Tester(name, options);
    this.testers[name] = tester;
    return tester;
  }
}

export default Config;
