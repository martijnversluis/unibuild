import * as fs from 'fs';
import AssetInput from './asset_input';

class AssetFile {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  modifiedTime(): number {
    if (!this.exists()) {
      return 0;
    }

    return fs.statSync(this.path).mtimeMs;
  }

  newerThan(other: AssetInput) {
    return this.modifiedTime() > other.modifiedTime();
  }

  exists() {
    return fs.existsSync(this.path);
  }

  canBeBuilt() {
    return false;
  }

  needsBuilding() {
    return false;
  }

  read() {
    return fs.readFileSync(this.path).toString();
  }

  write(contents: string) {
    fs.writeFileSync(this.path, contents);
  }
}

export default AssetFile;
