import dayjs from 'dayjs';

import { withTempFile, withTempFiles } from './support/utilities';

import AssetFile from '../src/asset_file';

describe('AssetFile', () => {
  describe('#modifiedTime', () => {
    it('returns the modified time of the file', () => {
      const mtime = dayjs().subtract(24, 'minutes').toDate();

      withTempFile('myfile.txt', mtime, (path) => {
        const assetFile = new AssetFile(path);

        expect(Math.floor(assetFile.modifiedTime() / 1000)).toEqual(Math.floor(mtime.getTime() / 1000));
      });
    });
  });

  describe('#newerThan', () => {
    it('returns true if the file is newer than the other file', () => {
      const now = dayjs();

      withTempFiles({
        'old.txt': now.subtract(24, 'minutes').toDate(),
        'new.txt': now.subtract(12, 'minutes').toDate(),
      }, ([oldFilePath, newFilePath]) => {
        const oldAssetFile = new AssetFile(oldFilePath);
        const newAssetFile = new AssetFile(newFilePath);

        expect(newAssetFile.newerThan(oldAssetFile)).toBe(true);
        expect(oldAssetFile.newerThan(newAssetFile)).toBe(false);
      });
    });
  });

  describe('#exists', () => {
    it('returns true if the file exists', () => {
      withTempFile('myfile.txt', new Date(), (path) => {
        const assetFile = new AssetFile(path);

        expect(assetFile.exists()).toBe(true);
      });
    });

    it('returns false if the file does not exist', () => {
      const assetFile = new AssetFile('nonexistent.txt');

      expect(assetFile.exists()).toBe(false);
    });
  });

  describe('#canBeBuilt', () => {
    it('always returns false', () => {
      const assetFile = new AssetFile('anyfile.txt');

      expect(assetFile.canBeBuilt()).toBe(false);
    });
  });

  describe('#needsBuilding', () => {
    it('always returns false', () => {
      const assetFile = new AssetFile('anyfile.txt');

      expect(assetFile.needsBuilding()).toBe(false);
    });
  });

  describe('#needsRebuild', () => {
    it('always returns false', () => {
      const assetFile = new AssetFile('anyfile.txt');

      expect(assetFile.needsRebuild()).toBe(false);
    });
  });

  describe('#isFile', () => {
    it('returns true if the path is a file', () => {
      withTempFile('myfile.txt', new Date(), (path) => {
        const assetFile = new AssetFile(path);

        expect(assetFile.isFile()).toBe(true);
      });
    });

    it('returns false if the path is not a file', () => {
      const assetFile = new AssetFile('.');

      expect(assetFile.isFile()).toBe(false);
    });
  });

  describe('#read', () => {
    it('returns the contents of the file', () => {
      withTempFile('myfile.txt', new Date(), (path) => {
        const assetFile = new AssetFile(path);
        const contents = 'Hello, world!';

        assetFile.write(contents);

        expect(assetFile.read()).toBe(contents);
      });
    });
  });

  describe('#write', () => {
    it('writes contents to the file', () => {
      withTempFile('myfile.txt', new Date(), (path) => {
        const assetFile = new AssetFile(path);
        const contents = 'Hello, world!';

        assetFile.write(contents);

        expect(assetFile.read()).toBe(contents);
      });
    });
  });

  describe('#remove', () => {
    it('removes the file', () => {
      withTempFile('myfile.txt', new Date(), (path) => {
        const assetFile = new AssetFile(path);

        expect(assetFile.exists()).toBe(true);

        assetFile.remove();

        expect(assetFile.exists()).toBe(false);
      });
    });
  });

  describe('#toString', () => {
    it('returns the path of the file', () => {
      const path = 'myfile.txt';
      const assetFile = new AssetFile(path);

      expect(assetFile.toString()).toBe(path);
    });
  });
});
