import AssetFile from './asset_file';
import AssetInput from './asset_input';
import BuildFunction from './build_function';
import AssetOptions from './asset_options';

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

    if (options.build && options.command) {
      throw new Error(`${name}: an asset cannot have both a build function and a command`);
    }

    this.buildFunction = options.build;
    this.command = options.command;
    this.releaseOnly = !!options.releaseOnly;
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

  needsBuilding(options: { release: boolean }) {
    return (!this.releaseOnly || options.release) && (!this.outfileExists() || this.inputChanged());
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
