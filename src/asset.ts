import AssetFile from './asset_file';
import AssetInput from './types/asset_input';
import AssetOptions from './types/asset_options';
import BuildFunction from './types/build_function';

import { generateCommand } from './cmd';

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

  needsBuilding(options: Partial<{ force: boolean, release: boolean }>) {
    return (!this.releaseOnly || options.release) &&
      (options.force || this.outfileMissing() || this.inputChanged());
  }

  needsRebuild() {
    return !this.outfileExists() || this.inputChanged() || this.inputNeedsRebuild();
  }

  isFile() {
    return this.outfile.isFile();
  }

  modifiedTime() {
    return this.outfile.modifiedTime();
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

  exists() {
    return this.outfileExists();
  }

  private outfileMissing() {
    return !this.outfileExists();
  }

  private outfileExists() {
    return this.outfile.exists();
  }

  private inputChanged() {
    return this.input.some((input) => input.newerThan(this));
  }

  private inputNeedsRebuild() {
    return this.input.some((input) => input.needsRebuild());
  }
}

export default Asset;
