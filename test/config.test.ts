import Config from '../src/config';
import { buildAsset } from './support/utilities';

describe('Config', () => {
  describe('constructor', () => {
    it('executes the provided callback with the config instance', () => {
      const callback = jest.fn();
      const config = new Config(callback);

      expect(callback).toHaveBeenCalledWith(config);
    });
  });

  describe('#asset', () => {
    it('creates and stores an Asset instance', () => {
      const config = new Config();
      const assetOptions = { input: 'src/index.js', outfile: 'dist/bundle.js' };
      const asset = config.asset('bundle', assetOptions);

      expect(asset).toBeDefined();
      expect(asset.name).toBe('bundle');
      expect(config.assets.bundle).toBe(asset);
    });
  });

  describe('#lint', () => {
    it('creates and stores a Linter instance', () => {
      const config = new Config();
      const asset = buildAsset();
      const linterOptions = { command: 'eslint src/**/*.js', requires: asset };
      const linter = config.lint('eslint', linterOptions);

      expect(linter).toBeDefined();
      expect(linter.name).toBe('eslint');
      expect(config.linters.eslint).toBe(linter);
    });
  });

  describe('#test', () => {
    it('creates and stores a Tester instance', () => {
      const config = new Config();
      const asset = buildAsset();
      const testerOptions = { command: 'jest', requires: asset };
      const tester = config.test('jest', testerOptions);

      expect(tester).toBeDefined();
      expect(tester.name).toBe('jest');
      expect(config.testers.jest).toBe(tester);
    });
  });

  describe('#preflight', () => {
    it('creates and stores a Preflight instance', () => {
      const config = new Config();
      const preflight = config.preflight({ gitClean: true });

      expect(preflight).toBeDefined();
      expect(preflight.gitClean).toBe(true);
      expect(config.preflightConfig).toBe(preflight);
    });

    it('defaults all checks to false', () => {
      const config = new Config();
      const preflight = config.preflight({});

      expect(preflight.gitClean).toBe(false);
      expect(preflight.gitInSyncWithBaseBranch).toBe(false);
      expect(preflight.npmAuth).toBe(false);
      expect(preflight.hasChecks()).toBe(false);
    });
  });

  describe('#preflightConfig', () => {
    it('is a Preflight with all checks disabled when preflight() is never called', () => {
      const config = new Config();

      expect(config.preflightConfig.hasChecks()).toBe(false);
      expect(config.preflightConfig.gitClean).toBe(false);
      expect(config.preflightConfig.gitInSyncWithBaseBranch).toBe(false);
      expect(config.preflightConfig.npmAuth).toBe(false);
    });
  });
});
