import Linter from '../src/linter';
import { buildAsset } from './support/utilities';

describe('Linter', () => {
  describe('#constructor', () => {
    it('sets the name, command, and requires properties', () => {
      const asset = buildAsset();

      const linter = new Linter('MyLinter', {
        command: 'echo "Linting..."',
        requires: asset,
      });

      expect(linter.name).toBe('MyLinter');
      expect(linter.command).toBe('echo "Linting..."');
      expect(linter.requires).toEqual([asset]);
    });

    it('generates the command if a function is provided', () => {
      const asset = buildAsset();

      const linter = new Linter('MyLinter', {
        command: (linterInstance: Linter) => `echo "Linting ${linterInstance.name}..."`,
        requires: asset,
      });

      expect(linter.command).toBe('echo "Linting MyLinter..."');
    });

    it('flattens the requires property if given an array', () => {
      const asset = buildAsset();

      const linter = new Linter('MyLinter', {
        command: 'echo "Linting..."',
        requires: [asset],
      });

      expect(linter.requires).toEqual([asset]);
    });
  });
});
