import Asset from './asset';

class DependencyNode {
  asset: Asset;

  dependents: DependencyNode[] = [];

  constructor(asset: Asset) {
    this.asset = asset;
  }
}

export default DependencyNode;
