import Asset from './asset';
import AssetOptions from './asset_options';

class Config {
  assets: Record<string, Asset> = {};

  constructor(callback: (config: Config) => void) {
    callback(this);
  }

  asset(name: string, options: AssetOptions): Asset {
    const asset = new Asset(name, options);
    this.assets[name] = asset;
    return asset;
  }
}

export default Config;
