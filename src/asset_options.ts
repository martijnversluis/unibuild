import BuildFunction from './build_function';
import { CommandGenerator } from './cmd';
import Asset from './asset';
import IAsset from './i_asset';

interface AssetOptions {
  build?: BuildFunction;
  command?: string | string[] | CommandGenerator<Asset>;
  input: string | IAsset | (string | IAsset)[];
  outfile: string;
  releaseOnly?: boolean;
}

export default AssetOptions;
