import Asset from './asset';
import AssetInput from './asset_input';

class BuildStages {
  grouping: string[][] = [];

  constructor(assets: Asset[]) {
    const stages: string[][] = [];
    const visited = new Set<string>();

    while (visited.size < assets.length) {
      const group: string[] = [];

      assets.forEach((asset: Asset) => {
        if (visited.has(asset.name)) return;

        if (asset.input.every((input: AssetInput) => {
          if (!input.canBeBuilt()) return true;

          const inputAsset = input as Asset;
          const inputBuildRequested = assets.includes(inputAsset);
          const alreadyPlanned = visited.has(inputAsset.name);
          const inCurrentGroup = group.includes(inputAsset.name);

          return (alreadyPlanned || !inputBuildRequested) && !inCurrentGroup;
        })) {
          group.push(asset.name);
          visited.add(asset.name);
        }
      });

      stages.push(group);
    }

    this.grouping = stages;
  }
}

export default BuildStages;
