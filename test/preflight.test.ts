import Preflight from '../src/preflight';

describe('Preflight', () => {
  describe('with no options', () => {
    it('defaults all checks to false', () => {
      const preflight = new Preflight();

      expect(preflight.gitClean).toBe(false);
      expect(preflight.gitInSyncWithBaseBranch).toBe(false);
      expect(preflight.npmAuth).toBe(false);
    });

    it('reports no checks', () => {
      const preflight = new Preflight();

      expect(preflight.hasChecks()).toBe(false);
    });
  });

  describe('with an empty options object', () => {
    it('defaults all checks to false', () => {
      const preflight = new Preflight({});

      expect(preflight.gitClean).toBe(false);
      expect(preflight.gitInSyncWithBaseBranch).toBe(false);
      expect(preflight.npmAuth).toBe(false);
      expect(preflight.hasChecks()).toBe(false);
    });
  });

  describe('with gitClean enabled', () => {
    it('reports it has checks', () => {
      const preflight = new Preflight({ gitClean: true });

      expect(preflight.gitClean).toBe(true);
      expect(preflight.hasChecks()).toBe(true);
    });
  });

  describe('with gitInSyncWithBaseBranch enabled', () => {
    it('reports it has checks', () => {
      const preflight = new Preflight({ gitInSyncWithBaseBranch: true });

      expect(preflight.gitInSyncWithBaseBranch).toBe(true);
      expect(preflight.hasChecks()).toBe(true);
    });
  });

  describe('with npmAuth enabled', () => {
    it('reports it has checks', () => {
      const preflight = new Preflight({ npmAuth: true });

      expect(preflight.npmAuth).toBe(true);
      expect(preflight.hasChecks()).toBe(true);
    });
  });
});
