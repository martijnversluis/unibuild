import unibuild from './src';

export default unibuild((u) => {
  u.lint('eslint', {
    command: 'node_modules/.bin/eslint',
    autofixCommand: 'node_modules/.bin/eslint --fix',
    requires: [],
  });

  u.test('jest', {
    command: 'jest',
    requires: [],
  });

  u.preflight({
    gitClean: true,
    gitInSyncWithBaseBranch: true,
    npmAuth: true,
  });
});
