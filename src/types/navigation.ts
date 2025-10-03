export interface Building {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  floorCount: number;
}

export interface NavigationNode {
  id: string;
  buildingId: string;
  name: string;
  type: 'room' | 'entrance' | 'intersection' | 'elevator' | 'stairs' | 'restroom' | 'exit';
  floor: number;
  latitude: number;
  longitude: number;
  description: string;
  isAccessible: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface NavigationEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  weight: number;
  isBidirectional: boolean;
  isAccessible: boolean;
  isActive: boolean;
  edgeType: 'hallway' | 'outdoor' | 'stairs' | 'elevator' | 'door';
}

export interface PathResult {
  nodes: NavigationNode[];
  totalDistance: number;
  estimatedTime: number;
  isAccessible: boolean;
}

export interface PopularDestination {
  node: NavigationNode;
  searchCount: number;
}
