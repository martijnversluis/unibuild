import dayjs from 'dayjs';

import Asset from '../src/asset';
import AssetFile from '../src/asset_file';
import BuildOptions from '../src/types/build_options';
import { buildAsset, withTempFiles } from './support/utilities';

describe('Asset', () => {
  describe('constructor', () => {
    it('assigns the correct properties', () => {
      const buildFunction = (_options: Partial<BuildOptions>) => 'output';

      const asset = new Asset('testAsset', {
        input: 'path/to/inputFile.js',
        outfile: 'path/to/outputFile.js',
        build: buildFunction,
        command: 'echo "Building asset"',
        releaseOnly: true,
      });

      expect(asset.name).toEqual('testAsset');
      expect(asset.input[0].path).toEqual('path/to/inputFile.js');
      expect(asset.outfile.path).toEqual('path/to/outputFile.js');
      expect(asset.buildFunction).toBe(buildFunction);
      expect(asset.releaseOnly).toBe(true);
      expect(asset.command).toEqual('echo "Building asset"');
    });

    it('accepts a single AssetFile as input', () => {
      const asset = buildAsset({
        input: new AssetFile('path/to/inputFile.js'),
      });

      expect(asset.input[0].path).toEqual('path/to/inputFile.js');
    });

    it('accepts an array of AssetFile and string inputs', () => {
      const asset = buildAsset({
        input: [
          new AssetFile('path/to/inputFile1.js'),
          'path/to/inputFile2.js',
        ],
      });

      expect(asset.input[0].path).toEqual('path/to/inputFile1.js');
      expect(asset.input[1].path).toEqual('path/to/inputFile2.js');
    });

    it('stringifies the command if a function is provided', () => {
      const asset = buildAsset({
        command: (opts: Asset) => `echo "Building ${opts.name}"`,
      });

      expect(asset.command).toEqual('echo "Building testAsset"');
    });
  });

  describe('#path', () => {
    it('returns the path of the outfile', () => {
      const asset = buildAsset({ outfile: 'path/to/outfile.js' });
      expect(asset.path).toEqual('path/to/outfile.js');
    });
  });

  describe('#hasAssetDependencies', () => {
    it('returns true when any input is an Asset', () => {
      const inputAsset = buildAsset();
      const asset = buildAsset({
        input: [
          inputAsset,
          new AssetFile('path/to/inputFile.js'),
        ],
      });

      expect(asset.hasAssetDependencies()).toBe(true);
    });

    it('returns false when no inputs are Assets', () => {
      const asset = buildAsset({
        input: [
          new AssetFile('path/to/inputFile1.js'),
          new AssetFile('path/to/inputFile2.js'),
        ],
      });

      expect(asset.hasAssetDependencies()).toBe(false);
    });
  });

  describe('#needsBuilding', () => {
    it('returns false when releaseOnly is true and release is false', () => {
      const asset = buildAsset({ releaseOnly: true });

      expect(asset.needsBuilding({ force: true, release: false })).toBe(false);
    });

    it('returns true when releaseOnly is true and release is true', () => {
      const asset = buildAsset({ releaseOnly: true });

      expect(asset.needsBuilding({ force: true, release: true })).toBe(true);
    });

    it('returns true when the outfile is missing', () => {
      const asset = buildAsset({
        input: 'path/to/inputFile.js',
        outfile: 'path/to/outputFile.js',
      });

      expect(asset.needsBuilding({ force: false, release: false })).toBe(true);
    });

    it('returns true when the outfile is outdated', () => {
      const now = dayjs();

      withTempFiles(
        {
          'oldInputFile.js': now.subtract(2, 'minute').toDate(),
          'newInputFile.js': now.toDate(),
          'outputFile.js': now.subtract(1, 'minute').toDate(),
        },
        ([inputPath1, inputPath2, outputPath]) => {
          const asset = buildAsset({
            input: [inputPath1, inputPath2],
            outfile: outputPath,
          });

          expect(asset.needsBuilding({ force: false, release: false })).toBe(true);
        },
      );
    });

    it('returns true when the outfile is up to date but force is true', () => {
      const now = dayjs();

      withTempFiles(
        {
          'inputFile.js': now.subtract(1, 'minute').toDate(),
          'outputFile.js': now.toDate(),
        },
        ([inputPath, outputPath]) => {
          const asset = buildAsset({
            input: inputPath,
            outfile: outputPath,
          });

          expect(asset.needsBuilding({ force: true, release: false })).toBe(true);
        },
      );
    });
  });

  describe('#needsRebuild', () => {
    it('returns true when the outfile does not exist', () => {
      const asset = buildAsset({
        input: 'path/to/inputFile.js',
        outfile: 'path/to/outputFile.js',
      });

      expect(asset.needsRebuild()).toBe(true);
    });

    it('returns true when any input is newer than the outfile', () => {
      const now = dayjs();

      withTempFiles(
        {
          'oldInputFile.js': now.subtract(2, 'minute').toDate(),
          'newInputFile.js': now.toDate(),
          'outputFile.js': now.subtract(1, 'minute').toDate(),
        },
        ([inputPath1, inputPath2, outputPath]) => {
          const asset = buildAsset({
            input: [inputPath1, inputPath2],
            outfile: outputPath,
          });

          expect(asset.needsRebuild()).toBe(true);
        },
      );
    });

    it('returns true when any input needs rebuild', () => {
      const now = dayjs();

      withTempFiles(
        {
          'inputFile1.js': now.subtract(2, 'minute').toDate(),
          'outputFile.js': now.toDate(),
        },
        ([inputPath1, inputPath2, outputPath]) => {
          const inputAsset = buildAsset({
            input: inputPath1,
            outfile: 'missing/file.js',
            build: () => 'output',
          });

          const asset = buildAsset({
            input: [inputAsset, new AssetFile(inputPath2)],
            outfile: outputPath,
          });

          expect(asset.needsRebuild()).toBe(true);
        },
      );
    });

    it('returns false when the outfile exists and is up to date', () => {
      const now = dayjs();

      withTempFiles(
        {
          'inputFile.js': now.subtract(2, 'minute').toDate(),
          'outputFile.js': now.subtract(1, 'minute').toDate(),
        },
        ([inputPath, outputPath]) => {
          const asset = buildAsset({
            input: inputPath,
            outfile: outputPath,
          });

          expect(asset.needsRebuild()).toBe(false);
        },
      );
    });
  });

  describe('#isFile', () => {
    it('returns true when the outfile is a file', () => {
      const now = dayjs();

      withTempFiles(
        { 'outputFile.js': now.toDate() },
        ([outputPath]) => {
          const asset = buildAsset({
            input: 'path/to/inputFile.js',
            outfile: outputPath,
          });

          expect(asset.isFile()).toBe(true);
        },
      );
    });

    it('returns false when the outfile is a directory', () => {
      const asset = buildAsset({
        input: 'path/to/inputFile.js',
        outfile: 'test',
      });

      expect(asset.isFile()).toBe(false);
    });
  });

  describe('#outfileMissing', () => {});
});
