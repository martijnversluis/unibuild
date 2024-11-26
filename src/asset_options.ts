import AssetInput from './asset_input';
import BuildFunction from './build_function';
import { CommandGenerator } from './cmd';
import Asset from './asset';

interface AssetOptions {
  build?: BuildFunction;
  command?: string | string[] | CommandGenerator<Asset>;
  input: string | AssetInput | (string | AssetInput)[];
  outfile: string;
  releaseOnly?: boolean;
}

export default AssetOptions;
