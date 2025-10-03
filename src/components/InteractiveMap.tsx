import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NavigationNode, PathResult } from '../types/navigation';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

const nodeTypeColors: Record<string, string> = {
  entrance: '#10b981',
  room: '#3b82f6',
  intersection: '#8b5cf6',
  elevator: '#f59e0b',
  stairs: '#ef4444',
  restroom: '#06b6d4',
  exit: '#10b981'
};

const createCustomIcon = (type: string, isSelected: boolean = false) => {
  const color = nodeTypeColors[type] || '#6b7280';
  const size = isSelected ? 16 : 12;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

interface MapUpdaterProps {
  path: PathResult | null;
}

function MapUpdater({ path }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (path && path.nodes.length > 0) {
      const bounds = L.latLngBounds(
        path.nodes.map(node => [node.latitude, node.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [path, map]);

  return null;
}

interface InteractiveMapProps {
  nodes: NavigationNode[];
  path: PathResult | null;
  selectedNode: NavigationNode | null;
  onNodeSelect: (node: NavigationNode) => void;
}

export default function InteractiveMap({ nodes, path, selectedNode, onNodeSelect }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  const center: [number, number] = [30.7606, 76.7285];

  const pathCoordinates: [number, number][] = path
    ? path.nodes.map(node => [node.latitude, node.longitude])
    : [];

  const pathNodeIds = new Set(path?.nodes.map(n => n.id) || []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full rounded-xl overflow-hidden shadow-2xl"
    >
      <MapContainer
        center={center}
        zoom={16}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {nodes.filter(node => node.isActive).map(node => (
          <Marker
            key={node.id}
            position={[node.latitude, node.longitude]}
            icon={createCustomIcon(
              node.type,
              node.id === selectedNode?.id || pathNodeIds.has(node.id)
            )}
            eventHandlers={{
              click: () => onNodeSelect(node)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-gray-900">{node.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{node.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Floor {node.floor}
                  </span>
                  {node.isAccessible && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                      Accessible
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {path && pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: '#2563eb',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 5',
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        <MapUpdater path={path} />
      </MapContainer>
    </motion.div>
  );
}
