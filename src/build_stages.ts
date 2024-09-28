import DependencyGraph from './dependency_graph';
import DependencyNode from './dependency_node';

class BuildStages {
  grouping: string[][] = [];

  constructor(dependencyGraph: DependencyGraph) {
    Object.values(dependencyGraph.roots).forEach((root: DependencyNode) => {
      this.groupNodes(root);
    });

    this.grouping = this.filterNodes(this.grouping).filter((row) => row.length > 0);
  }

  groupNodes(node: DependencyNode, level = 0) {
    this.grouping[level] ||= [];
    this.grouping[level].push(node.asset.name);

    node.dependents.forEach((dependent: DependencyNode) => {
      this.groupNodes(dependent, level + 1);
    });
  }

  filterNodes(matrix: string[][]): string[][] {
    const seen = new Set<string>();

    return matrix.map((row) => {
      const filteredRow = row.filter((item) => !seen.has(item));
      filteredRow.forEach((item) => seen.add(item));
      return Array.from(new Set(filteredRow));
    });
  }
}

export default BuildStages;
