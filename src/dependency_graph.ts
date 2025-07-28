import Asset from './asset';
import DependencyNode from './dependency_node';

class DependencyGraph {
  roots: Record<string, DependencyNode> = {};

  nodes: Record<string, DependencyNode> = {};

  constructor(assets: Asset[]) {
    assets.forEach((asset) => {
      const node = this.getNode(asset);

      asset.input.forEach((input) => {
        if (input instanceof Asset) {
          const inputNode = this.getNode(input);
          inputNode.dependents.push(node);
        }
      });
    });
  }

  getNode(asset: Asset) {
    if (asset.name in this.nodes) {
      return this.nodes[asset.name];
    }

    const node = new DependencyNode(asset);
    this.nodes[asset.name] = node;

    if (!asset.hasAssetDependencies()) {
      this.roots[asset.name] = node;
    }

    return node;
  }
}

export default DependencyGraph;
