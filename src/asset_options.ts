import AssetInput from './asset_input';
import BuildFunction from './build_function';

interface AssetOptions {
  build?: BuildFunction;
  command?: string;
  input: string | AssetInput | (string | AssetInput)[];
  outfile: string;
  releaseOnly?: boolean;
}

export default AssetOptions;
