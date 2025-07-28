import * as fs from 'fs/promises';
import IAsset from './i_asset';

class AssetFile implements IAsset {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  async modifiedTime(): Promise<number> {
    if (!(await this.exists())) {
      return 0;
    }

    const stats = await fs.stat(this.path);
    return stats.mtimeMs;
  }

  async newerThan(other: IAsset): Promise<boolean> {
    return (await this.modifiedTime()) > (await other.modifiedTime());
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.path);
      return true;
    } catch {
      return false;
    }
  }

  async canBeBuilt(): Promise<boolean> {
    return false;
  }

  async needsBuilding(): Promise<boolean> {
    return false;
  }

  async needsRebuild(): Promise<boolean> {
    return false;
  }

  async isFile(): Promise<boolean> {
    const stats = await fs.lstat(this.path);
    return stats.isFile();
  }

  async read(): Promise<string> {
    const data = await fs.readFile(this.path);
    return data.toString();
  }

  async write(contents: string): Promise<void> {
    await fs.writeFile(this.path, contents);
  }

  async remove(): Promise<void> {
    await fs.unlink(this.path);
  }

  toString(): string {
    return this.path;
  }
}

export default AssetFile;
