import Tester from '../src/tester';
import { buildAsset } from './support/utilities';

describe('Tester', () => {
  describe('#constructor', () => {
    it('sets the name, command, and requires properties', () => {
      const asset = buildAsset();

      const tester = new Tester('MyTester', {
        command: 'echo "Testing..."',
        requires: asset,
      });

      expect(tester.name).toBe('MyTester');
      expect(tester.command).toBe('echo "Testing..."');
      expect(tester.requires).toEqual([asset]);
    });

    it('generates the command if a function is provided', () => {
      const asset = buildAsset();

      const tester = new Tester('MyTester', {
        command: (testerInstance: Tester) => `echo "Testing ${testerInstance.name}..."`,
        requires: asset,
      });

      expect(tester.command).toBe('echo "Testing MyTester..."');
    });

    it('flattens the requires property if given an array', () => {
      const asset = buildAsset();

      const tester = new Tester('MyTester', {
        command: 'echo "Testing..."',
        requires: [asset],
      });

      expect(tester.requires).toEqual([asset]);
    });
  });
});
