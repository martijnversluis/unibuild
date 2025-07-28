import AssetFile from './asset_file';
import BuildFunction from './build_function';
import AssetOptions from './asset_options';
import { generateCommand } from './cmd';
import IAsset from './i_asset';

class Asset implements IAsset {
  buildFunction?: BuildFunction;

  command?: string;

  input: IAsset[];

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

  static normalizeInput(inputs: string | IAsset | (string | IAsset)[]): IAsset[] {
    return [inputs].flat().map((input) => {
      if (typeof input === 'string') {
        return new AssetFile(input);
      }

      return input;
    });
  }

  get path(): string {
    return this.outfile.path;
  }

  hasAssetDependencies(): boolean {
    return this.input.some((input) => input instanceof Asset);
  }

  async needsBuilding(options: Partial<{ force: boolean,  release: boolean }>): Promise<boolean> {
    const outfileMissing = await this.outfileMissing();
    const inputChanged = await this.inputChanged();

    return (!this.releaseOnly || !!options.release) && (options.force || outfileMissing || inputChanged);
  }

  async needsRebuild(): Promise<boolean> {
    return !(await this.outfileExists()) || (await this.inputChanged()) || (await this.inputNeedsRebuild());
  }

  async exists(): Promise<boolean> {
    return await this.outfileExists();
  }

  async isFile(): Promise<boolean> {
    return await this.outfile.isFile();
  }

  async outfileMissing(): Promise<boolean> {
    return !(await this.outfileExists());
  }

  async outfileExists(): Promise<boolean> {
    return await this.outfile.exists();
  }

  async modifiedTime(): Promise<number> {
    return await this.outfile.modifiedTime();
  }

  async inputChanged(): Promise<boolean> {
    for (const input of this.input) {
      if (await input.newerThan(this)) {
        return true;
      }
    }

    return false;
  }

  async inputNeedsRebuild(): Promise<boolean> {
    for (const input of this.input) {
      if (await input.needsRebuild()) {
        return true;
      }
    }

    return false;
  }

  async newerThan(other: IAsset): Promise<boolean> {
    return await this.outfile.newerThan(other);
  }

  async canBeBuilt(): Promise<boolean> {
    return true;
  }

  async read(): Promise<string> {
    return await this.outfile.read();
  }

  toString(): string {
    return this.outfile.toString();
  }
}

export default Asset;
