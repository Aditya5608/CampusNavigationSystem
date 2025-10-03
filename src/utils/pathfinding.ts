import { NavigationNode, NavigationEdge, PathResult } from '../types/navigation';

interface GraphNode {
  id: string;
  distance: number;
  previous: string | null;
}

export class NavigationGraph {
  private nodes: Map<string, NavigationNode>;
  private edges: Map<string, NavigationEdge[]>;
  private adjacencyList: Map<string, { nodeId: string; weight: number; edge: NavigationEdge }[]>;

  constructor(nodes: NavigationNode[], edges: NavigationEdge[]) {
    this.nodes = new Map(nodes.map(node => [node.id, node]));
    this.edges = new Map();
    this.adjacencyList = new Map();

    edges.forEach(edge => {
      if (!this.edges.has(edge.fromNodeId)) {
        this.edges.set(edge.fromNodeId, []);
      }
      this.edges.get(edge.fromNodeId)!.push(edge);

      if (!this.adjacencyList.has(edge.fromNodeId)) {
        this.adjacencyList.set(edge.fromNodeId, []);
      }
      this.adjacencyList.get(edge.fromNodeId)!.push({
        nodeId: edge.toNodeId,
        weight: edge.weight,
        edge
      });

      if (edge.isBidirectional) {
        if (!this.edges.has(edge.toNodeId)) {
          this.edges.set(edge.toNodeId, []);
        }
        this.edges.get(edge.toNodeId)!.push({
          ...edge,
          fromNodeId: edge.toNodeId,
          toNodeId: edge.fromNodeId
        });

        if (!this.adjacencyList.has(edge.toNodeId)) {
          this.adjacencyList.set(edge.toNodeId, []);
        }
        this.adjacencyList.get(edge.toNodeId)!.push({
          nodeId: edge.fromNodeId,
          weight: edge.weight,
          edge
        });
      }
    });
  }

  findShortestPath(
    startNodeId: string,
    endNodeId: string,
    requireAccessible: boolean = false
  ): PathResult | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    this.nodes.forEach((_, nodeId) => {
      distances.set(nodeId, Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    });

    distances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      let currentNodeId: string | null = null;
      let minDistance = Infinity;

      unvisited.forEach(nodeId => {
        const distance = distances.get(nodeId)!;
        if (distance < minDistance) {
          minDistance = distance;
          currentNodeId = nodeId;
        }
      });

      if (currentNodeId === null || minDistance === Infinity) {
        break;
      }

      if (currentNodeId === endNodeId) {
        break;
      }

      unvisited.delete(currentNodeId);

      const neighbors = this.adjacencyList.get(currentNodeId) || [];
      neighbors.forEach(({ nodeId, weight, edge }) => {
        if (!edge.isActive) return;
        if (requireAccessible && !edge.isAccessible) return;

        const alt = distances.get(currentNodeId)! + weight;
        if (alt < distances.get(nodeId)!) {
          distances.set(nodeId, alt);
          previous.set(nodeId, currentNodeId);
        }
      });
    }

    if (distances.get(endNodeId) === Infinity) {
      return null;
    }

    const path: NavigationNode[] = [];
    let currentId: string | null = endNodeId;

    while (currentId !== null) {
      const node = this.nodes.get(currentId);
      if (node) {
        path.unshift(node);
      }
      currentId = previous.get(currentId) || null;
    }

    const totalDistance = distances.get(endNodeId)!;
    const estimatedTime = Math.ceil(totalDistance / 1.4);

    let isAccessible = true;
    for (let i = 0; i < path.length - 1; i++) {
      const fromNode = path[i];
      const toNode = path[i + 1];
      const edges = this.adjacencyList.get(fromNode.id) || [];
      const edge = edges.find(e => e.nodeId === toNode.id);
      if (edge && !edge.edge.isAccessible) {
        isAccessible = false;
        break;
      }
    }

    return {
      nodes: path,
      totalDistance,
      estimatedTime,
      isAccessible
    };
  }

  getNodeById(nodeId: string): NavigationNode | undefined {
    return this.nodes.get(nodeId);
  }

  searchNodes(query: string): NavigationNode[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.nodes.values())
      .filter(node =>
        node.isActive &&
        (node.name.toLowerCase().includes(lowerQuery) ||
          node.description.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      });
  }
}
