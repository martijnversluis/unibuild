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
      this.command = generateCommand(options.command, this.outfile.path);
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

  needsBuilding(options: { force: boolean,  release: boolean }) {
    return (!this.releaseOnly || options.release) &&
      (options.force || !this.outfileExists() || this.inputChanged());
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

  newerThan(other: AssetInput) {
    return this.outfile.newerThan(other);
  }

  canBeBuilt() {
    return true;
  }

  read() {
    return this.outfile.read();
  }
}

export default Asset;
