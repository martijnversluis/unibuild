import BuildStages from '../src/build_stages';
import { buildAsset } from './support/utilities';

describe('BuildStages', () => {
  it('should group assets into build stages based on dependencies', () => {
    const baseA = buildAsset({ name: 'baseA' });
    const baseB = buildAsset({ name: 'baseB' });
    const midA = buildAsset({ name: 'midA', input: [baseA] });
    const midB = buildAsset({ name: 'midB', input: [baseB] });
    const top = buildAsset({ name: 'top', input: [midA, midB] });
    const independent = buildAsset({ name: 'independent' });
    const assets = [baseA, baseB, midA, midB, top, independent];
    const buildStages = new BuildStages(assets);

    expect(buildStages.grouping).toEqual([
      ['baseA', 'baseB', 'independent'],
      ['midA', 'midB'],
      ['top'],
    ]);
  });
});
