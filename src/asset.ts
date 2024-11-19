import AssetFile from './asset_file';
import AssetInput from './asset_input';
import BuildFunction from './build_function';
import AssetOptions from './asset_options';
import {generateCommand} from "./cmd";

class Asset {
  buildFunction?: BuildFunction;

  command?: string;

  input: AssetInput[];

  name: string;

  outfile: AssetFile;

  releaseOnly = false;

  constructor(name: string, options: AssetOptions) {
    this.name = name;
    this.input = Asset.normalizeInput(options.input);
    this.outfile = new AssetFile(options.outfile);

    this.buildFunction = options.build;
    this.releaseOnly = !!options.releaseOnly;

    if (options.command) {
      this.command = generateCommand<Asset>(options.command, this);
    }
  }

  static normalizeInput(inputs: string | AssetInput | (string | AssetInput)[]): AssetInput[] {
    return [inputs].flat().map((input) => {
      if (typeof input === 'string') {
        return new AssetFile(input);
      }

      return input;
    });
  }

  get path() {
    return this.outfile.path;
  }

  hasAssetDependencies() {
    return this.input.some((input) => input instanceof Asset);
  }

  needsBuilding(options: Partial<{ force: boolean,  release: boolean }>) {
    return (!this.releaseOnly || options.release) &&
      (options.force || !this.outfileExists() || this.inputChanged());
  }

  needsRebuild() {
    return !this.outfileExists() || this.inputChanged() || this.inputNeedsRebuild();
  }

  exists() {
    return this.outfileExists();
  }

  outfileExists() {
    return this.outfile.exists();
  }

  modifiedTime() {
    return this.outfile.modifiedTime();
  }

  inputChanged() {
    return this.input.some((input) => input.newerThan(this));
  }

  inputNeedsRebuild() {
    return this.input.some((input) => input.needsRebuild());
  }

  newerThan(other: AssetInput) {
    return this.outfile.newerThan(other);
  }

  canBeBuilt() {
    return true;
  }

  read() {
    return this.outfile.read();
  }

  toString() {
    return this.outfile.toString();
  }
}

export default Asset;
