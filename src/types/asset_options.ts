import Asset from '../asset';
import AssetInput from './asset_input';
import BuildFunction from './build_function';

import { CommandGenerator } from '../cmd';

interface AssetOptions {
  build?: BuildFunction;
  command?: string | string[] | CommandGenerator<Asset>;
  input: string | AssetInput | (string | AssetInput)[];
  outfile: string;
  releaseOnly?: boolean;
}

export default AssetOptions;
