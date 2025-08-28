import dayjs from 'dayjs';
import { devNull } from 'os';
import fs from 'node:fs';

import Builder from '../src/builder';
import Config from '../src/config';
import Linter from '../src/linter';
import MockCommandExecutor from './support/mock_command_executor';
import NullLogger from '../src/null_logger';
import Tester from '../src/tester';

import {
  buildAsset,
  removeTempFile,
  tempFilePath,
  withTempFile,
  withTempFiles,
} from './support/utilities';

describe('Builder', () => {
  describe('#build', () => {
    it('builds assets in the correct order', () => {
      const now = dayjs();

      withTempFiles({
        'inputChanged': now.add(1, 'minute').toDate(),
        'inputUnchanged': now.subtract(1, 'minute').toDate(),
        'baseUpToDate': now.add(2, 'minutes').toDate(),
        'baseOutdated': now.subtract(2, 'minutes').toDate(),
        'midUpToDate': now.add(2, 'minutes').toDate(),
      }, ([inputChangedPath, inputUnchangedPath, baseUpToDatePath, baseOutdatedPath, midUpToDatePath]) => {
        const topOutputPath = tempFilePath('topOutput');

        const baseUpToDate = buildAsset({
          name: 'baseUpToDate',
          input: inputUnchangedPath,
          outfile: baseUpToDatePath,
          build: () => 'baseUpToDate new contents',
        });

        baseUpToDate.outfile.write('baseUpToDate old contents');

        const baseOutdated = buildAsset({
          name: 'baseOutdated',
          input: [inputChangedPath],
          outfile: baseOutdatedPath,
          command: `printf "baseOutdated contents" > ${baseOutdatedPath}`,
        });

        const midUpToDate = buildAsset({
          name: 'midUpToDate',
          input: [baseOutdated],
          outfile: midUpToDatePath,
          command: (asset) => `printf "${asset.name} contents" > ${asset.outfile}`,
        });

        const top = buildAsset({
          name: 'top',
          input: [midUpToDate, baseUpToDate],
          outfile: topOutputPath,
          build: (_options, ...inputs) => inputs.join(', '),
        });

        const config = new Config();
        config.assets = {
          baseUpToDate, baseOutdated, midUpToDate, top,
        };

        const builder = new Builder(config, undefined, new NullLogger());

        builder.build([], { force: false, parallel: false, release: false });

        expect(top.read()).toEqual('midUpToDate contents, baseUpToDate old contents');

        removeTempFile(topOutputPath);
      });
    });

    it('builds the specified assets', () => {
      const now = dayjs();

      withTempFiles({
        'inputChanged': now.add(1, 'minute').toDate(),
        'inputUnchanged': now.subtract(1, 'minute').toDate(),
        'baseUpToDate': now.add(2, 'minutes').toDate(),
        'baseOutdated': now.subtract(2, 'minutes').toDate(),
      }, ([inputChangedPath, inputUnchangedPath, baseUpToDatePath, baseOutdatedPath]) => {
        const midUpToDatePath = tempFilePath('midUpToDate');
        const topOutputPath = tempFilePath('topOutput');

        const baseUpToDate = buildAsset({
          name: 'baseUpToDate',
          input: inputUnchangedPath,
          outfile: baseUpToDatePath,
          build: () => 'baseUpToDate new contents',
        });

        baseUpToDate.outfile.write('baseUpToDate old contents');

        const baseOutdated = buildAsset({
          name: 'baseOutdated',
          input: [inputChangedPath],
          outfile: baseOutdatedPath,
          command: `printf "baseOutdated contents" > ${baseOutdatedPath}`,
        });

        const midUpToDate = buildAsset({
          name: 'midUpToDate',
          input: [baseOutdated],
          outfile: midUpToDatePath,
          command: (asset) => `printf "${asset.name} contents" > ${asset.outfile}`,
        });

        const top = buildAsset({
          name: 'top',
          input: [midUpToDate, baseUpToDate],
          outfile: topOutputPath,
          build: (_options, ...inputs) => inputs.join(', '),
        });

        const config = new Config();
        config.assets = {
          baseUpToDate, baseOutdated, midUpToDate, top,
        };

        const builder = new Builder(config, undefined, new NullLogger());

        builder.build(['baseOutdated'], { force: false, parallel: false, release: false });

        expect(baseOutdated.read()).toEqual('baseOutdated contents');
        expect(midUpToDate.exists()).toBe(false);
        expect(top.exists()).toBe(false);
      });
    });

    it('force builds the assets when enabled', () => {
      const now = dayjs();

      withTempFiles({
        'inputUnchanged': now.subtract(1, 'minute').toDate(),
        'baseUpToDate': now.add(2, 'minutes').toDate(),
      }, ([inputUnchangedPath, baseUpToDatePath]) => {
        const baseUpToDate = buildAsset({
          name: 'baseUpToDate',
          input: inputUnchangedPath,
          outfile: baseUpToDatePath,
          build: () => 'baseUpToDate new contents',
        });

        baseUpToDate.outfile.write('baseUpToDate old contents');

        const config = new Config();
        config.assets = { baseUpToDate };

        const builder = new Builder(config, undefined, new NullLogger());

        builder.build([], { force: true, parallel: false, release: false });

        expect(baseUpToDate.read()).toEqual('baseUpToDate new contents');
      });
    });

    it('does not build releaseOnly assets when release is false', () => {
      const now = dayjs();

      withTempFile('input', now.subtract(1, 'minute').toDate(), (inputPath) => {
        const normalOutputPath = tempFilePath('normalOutput');
        const releaseOutputPath = tempFilePath('releaseOutput');

        const normal = buildAsset({
          name: 'normal',
          input: inputPath,
          outfile: normalOutputPath,
          build: () => 'normal contents',
        });

        const releaseOnly = buildAsset({
          name: 'releaseOnly',
          input: inputPath,
          outfile: releaseOutputPath,
          build: () => 'releaseOnly contents',
          releaseOnly: true,
        });

        const config = new Config();
        config.assets = { normal, releaseOnly };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.build([], { force: false, parallel: false, release: false });

        expect(normal.read()).toEqual('normal contents');
        expect(releaseOnly.exists()).toBe(false);
      });
    });

    it('builds releaseOnly assets when release is true', () => {
      const now = dayjs();

      withTempFile('input', now.subtract(1, 'minute').toDate(), (inputPath) => {
        const normalOutputPath = tempFilePath('normalOutput');
        const releaseOutputPath = tempFilePath('releaseOutput');

        const normal = buildAsset({
          name: 'normal',
          input: inputPath,
          outfile: normalOutputPath,
          build: () => 'normal contents',
        });

        const releaseOnly = buildAsset({
          name: 'releaseOnly',
          input: inputPath,
          outfile: releaseOutputPath,
          build: () => 'releaseOnly contents',
          releaseOnly: true,
        });

        const config = new Config();
        config.assets = { normal, releaseOnly };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.build([], { force: false, parallel: false, release: true });

        expect(normal.read()).toEqual('normal contents');
        expect(releaseOnly.read()).toEqual('releaseOnly contents');
      });
    });
  });

  describe('#lint', () => {
    it('runs the configured linters', () => {
      const now = dayjs();

      withTempFiles({
        one: now.toDate(),
        two: now.toDate(),
      }, ([onePath, twoPath]) => {
        const oneLinter = new Linter('oneLinter', {
          requires: [],
          command: `printf "Linting one" > ${onePath}`,
          autofixCommand: `printf "Autofixing one" > ${onePath}`,
        });

        const twoLinter = new Linter('twoLinter', {
          requires: [],
          command: `printf "Linting two" > ${twoPath}`,
        });

        const config = new Config();
        config.linters = { oneLinter, twoLinter };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.lint({ fix: false });

        expect(fs.readFileSync(onePath, 'utf-8').trim()).toEqual('Linting one');
        expect(fs.readFileSync(twoPath, 'utf-8').trim()).toEqual('Linting two');
      });
    });

    it('runs the autofix command when fix is true and autofixCommand is provided', () => {
      const now = dayjs();

      withTempFiles({
        one: now.toDate(),
        two: now.toDate(),
      }, ([onePath, twoPath]) => {
        const oneLinter = new Linter('oneLinter', {
          requires: [],
          command: `printf "Linting one" > ${onePath}`,
          autofixCommand: `printf "Autofixing one" > ${onePath}`,
        });

        const twoLinter = new Linter('twoLinter', {
          requires: [],
          command: `printf "Linting two" > ${twoPath}`,
        });

        const config = new Config();
        config.linters = { oneLinter, twoLinter };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.lint({ fix: true });

        expect(fs.readFileSync(onePath, 'utf-8').trim()).toEqual('Autofixing one');
        expect(fs.readFileSync(twoPath, 'utf-8').trim()).toEqual('Linting two');
      });
    });

    it('builds outdated required assets before linting', () => {
      const now = dayjs();

      withTempFiles({
        inputOne: now.toDate(),
        inputTwo: now.toDate(),
        assetOne: now.subtract(1, 'minute').toDate(),
        assetTwo: now.add(1, 'minute').toDate(),
        lintOutput: now.toDate(),
      }, ([inputOnePath, inputTwoPath, assetOnePath, assetTwoPath, lintOutputPath]) => {
        const inputOne = buildAsset({
          name: 'inputOne',
          input: inputOnePath,
          outfile: assetOnePath,
          build: () => 'assetOne contents',
        });

        const inputTwo = buildAsset({
          name: 'inputTwo',
          input: inputTwoPath,
          outfile: assetTwoPath,
          build: () => 'assetTwo new contents',
        });

        const linter = new Linter('testLinter', {
          requires: [inputOne, inputTwo],
          command: (l) => `printf "Linting ${l.name}" > ${lintOutputPath}`,
        });

        const config = new Config();
        config.assets = { inputOne, inputTwo };
        config.linters = { linter };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.lint({ fix: false });

        expect(fs.readFileSync(lintOutputPath, 'utf-8').trim()).toEqual('Linting testLinter');
        expect(inputOne.read()).toEqual('assetOne contents');
        expect(inputTwo.read()).toEqual('');
      });
    });

    it('also builds releaseOnly assets', () => {
      const now = dayjs();

      withTempFiles({
        input: now.toDate(),
        asset: now.subtract(1, 'minute').toDate(),
      }, ([inputPath, assetPath]) => {
        const asset = buildAsset({
          name: 'asset',
          input: inputPath,
          outfile: assetPath,
          build: () => 'asset new contents',
          releaseOnly: true,
        });

        const linter = new Linter('testLinter', {
          requires: asset,
          command: `printf "Linting" > ${devNull}`,
        });

        const config = new Config();
        config.assets = { asset };
        config.linters = { linter };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.lint({ fix: false });

        expect(asset.read()).toEqual('asset new contents');
      });
    });
  });

  describe('#test', () => {
    it('runs the configured testers', () => {
      const now = dayjs();

      withTempFiles({
        one: now.toDate(),
        two: now.toDate(),
      }, ([onePath, twoPath]) => {
        const oneTester = new Tester('oneTester', {
          requires: [],
          command: `printf "Testing one" > ${onePath}`,
        });

        const twoTester = new Tester('twoTester', {
          requires: [],
          command: `printf "Testing two" > ${twoPath}`,
        });

        const config = new Config();
        config.testers = { oneTester, twoTester };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.test();

        expect(fs.readFileSync(onePath, 'utf-8').trim()).toEqual('Testing one');
        expect(fs.readFileSync(twoPath, 'utf-8').trim()).toEqual('Testing two');
      });
    });

    it('builds outdated required assets before testing', () => {
      const now = dayjs();

      withTempFiles({
        inputOne: now.toDate(),
        inputTwo: now.toDate(),
        assetOne: now.subtract(1, 'minute').toDate(),
        assetTwo: now.add(1, 'minute').toDate(),
        testOutput: now.toDate(),
      }, ([inputOnePath, inputTwoPath, assetOnePath, assetTwoPath, testOutputPath]) => {
        const inputOne = buildAsset({
          name: 'inputOne',
          input: inputOnePath,
          outfile: assetOnePath,
          build: () => 'assetOne contents',
        });

        const inputTwo = buildAsset({
          name: 'inputTwo',
          input: inputTwoPath,
          outfile: assetTwoPath,
          build: () => 'assetTwo new contents',
        });

        const tester = new Tester('testTester', {
          requires: [inputOne, inputTwo],
          command: (l) => `printf "Testing ${l.name}" > ${testOutputPath}`,
        });

        const config = new Config();
        config.assets = { inputOne, inputTwo };
        config.testers = { tester };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.test();

        expect(fs.readFileSync(testOutputPath, 'utf-8').trim()).toEqual('Testing testTester');
        expect(inputOne.read()).toEqual('assetOne contents');
        expect(inputTwo.read()).toEqual('');
      });
    });

    it('also builds releaseOnly assets', () => {
      const now = dayjs();

      withTempFiles({
        input: now.toDate(),
        asset: now.subtract(1, 'minute').toDate(),
      }, ([inputPath, assetPath]) => {
        const asset = buildAsset({
          name: 'asset',
          input: inputPath,
          outfile: assetPath,
          build: () => 'asset new contents',
          releaseOnly: true,
        });

        const tester = new Tester('testTester', {
          requires: asset,
          command: `printf "Testing" > ${devNull}`,
        });

        const config = new Config();
        config.assets = { asset };
        config.testers = { tester };
        const builder = new Builder(config, undefined, new NullLogger());

        builder.test();

        expect(asset.read()).toEqual('asset new contents');
      });
    });
  });

  describe('#clean', () => {
    it('removes all built assets', () => {
      const config = new Config();

      withTempFiles({
        asset1: new Date(),
        asset2: new Date(),
      }, ([asset1Path, asset2Path]) => {
        const asset1 = buildAsset({ outfile: asset1Path });
        const asset2 = buildAsset({ outfile: asset2Path });
        config.assets = { asset1, asset2 };

        const builder = new Builder(config, undefined, new NullLogger());
        builder.clean([]);

        expect(asset1.exists()).toBe(false);
        expect(asset2.exists()).toBe(false);
      });
    });

    it('removes the provided assets', () => {
      const config = new Config();

      withTempFiles({
        asset1: new Date(),
        asset2: new Date(),
      }, ([asset1Path, asset2Path]) => {
        const asset1 = buildAsset({ outfile: asset1Path });
        const asset2 = buildAsset({ outfile: asset2Path });
        config.assets = { asset1, asset2 };

        const builder = new Builder(config, undefined, new NullLogger());
        builder.clean(['asset1']);

        expect(asset1.exists()).toBe(false);
        expect(asset2.exists()).toBe(true);
      });
    });
  });

  describe('#bump', () => {
    it('bumps the version in package.json', () => {
      const config = new Config();
      const mockCommandExecutor = new MockCommandExecutor();

      const builder = new Builder(
        config,
        mockCommandExecutor.execute.bind(mockCommandExecutor),
        new NullLogger(),
      );

      builder.bump('patch');

      expect(mockCommandExecutor.executedCommands).toEqual(['npm version patch']);
    });
  });

  describe('#gitPush', () => {
    it('pushes commits and tags to git', () => {
      const config = new Config();
      const mockCommandExecutor = new MockCommandExecutor();

      const builder = new Builder(
        config,
        mockCommandExecutor.execute.bind(mockCommandExecutor),
        new NullLogger(),
      );

      builder.gitPush();

      expect(mockCommandExecutor.executedCommands).toEqual(['git push && git push --tags']);
    });
  });

  describe('#publish', () => {
    it('publishes to npm', () => {
      const config = new Config();
      const mockCommandExecutor = new MockCommandExecutor();

      const builder = new Builder(
        config,
        mockCommandExecutor.execute.bind(mockCommandExecutor),
        new NullLogger(),
      );

      builder.publish();

      expect(mockCommandExecutor.executedCommands).toEqual(['yarn npm publish']);
    });
  });
});
