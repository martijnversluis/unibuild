import AssetInput from './asset_input';
import BuildFunction from './build_function';
import { CommandGenerator } from './cmd';

interface AssetOptions {
  build?: BuildFunction;
  command?: string | CommandGenerator;
  input: string | AssetInput | (string | AssetInput)[];
  outfile: string;
  releaseOnly?: boolean;
}

export default AssetOptions;
