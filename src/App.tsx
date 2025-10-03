import { useState, useMemo } from 'react';
import { Navigation2, MapPin, Route } from 'lucide-react';
import InteractiveMap from './components/InteractiveMap';
import SearchBar from './components/SearchBar';
import RoutePanel from './components/RoutePanel';
import PopularDestinations from './components/PopularDestinations';
import AdminPanel from './components/AdminPanel';
import { NavigationGraph } from './utils/pathfinding';
import { NavigationNode, PathResult, PopularDestination } from './types/navigation';
import { buildings, navigationNodes as initialNodes, navigationEdges as initialEdges, popularDestinations } from './data/sampleData';
import { motion } from 'framer-motion';

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [startNode, setStartNode] = useState<NavigationNode | null>(null);
  const [endNode, setEndNode] = useState<NavigationNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<NavigationNode | null>(null);
  const [path, setPath] = useState<PathResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [requireAccessible, setRequireAccessible] = useState(false);

  const graph = useMemo(() => new NavigationGraph(nodes, edges), [nodes, edges]);

  const popularDests: PopularDestination[] = useMemo(() => {
    return popularDestinations
      .map(pd => {
        const node = nodes.find(n => n.id === pd.nodeId);
        return node ? { node, searchCount: pd.searchCount } : null;
      })
      .filter((item): item is PopularDestination => item !== null)
      .sort((a, b) => b.searchCount - a.searchCount);
  }, [nodes]);

  const handleSearch = (query: string) => {
    return graph.searchNodes(query);
  };

  const calculateRoute = () => {
    if (!startNode || !endNode) return;

    setIsCalculating(true);
    setTimeout(() => {
      const result = graph.findShortestPath(startNode.id, endNode.id, requireAccessible);
      setPath(result);
      setIsCalculating(false);
    }, 800);
  };

  const handleClearRoute = () => {
    setStartNode(null);
    setEndNode(null);
    setPath(null);
    setSelectedNode(null);
  };

  const handleAddNode = (nodeData: Omit<NavigationNode, 'id'>) => {
    const newNode: NavigationNode = {
      ...nodeData,
      id: `n${Date.now()}`
    };
    setNodes([...nodes, newNode]);
  };

  const handleUpdateNode = (id: string, updates: Partial<NavigationNode>) => {
    setNodes(nodes.map(node => node.id === id ? { ...node, ...updates } : node));
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(node => node.id !== id));
    setEdges(edges.filter(edge => edge.fromNodeId !== id && edge.toNodeId !== id));
    if (startNode?.id === id) setStartNode(null);
    if (endNode?.id === id) setEndNode(null);
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-2xl"
      >
        <div className="container mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Navigation2 className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Chandigarh University Navigator</h1>
              <p className="text-blue-100 text-lg mt-1">Real-time navigation for Chandigarh University, Mohali</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold mb-2 text-blue-100">Starting Point</label>
              <SearchBar
                nodes={nodes}
                onSearch={handleSearch}
                onNodeSelect={setStartNode}
                placeholder="Where are you now?"
                value={startNode}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold mb-2 text-blue-100">Destination</label>
              <SearchBar
                nodes={nodes}
                onSearch={handleSearch}
                onNodeSelect={setEndNode}
                placeholder="Where do you want to go?"
                value={endNode}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <label className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl cursor-pointer hover:bg-white/20 transition-colors">
              <input
                type="checkbox"
                checked={requireAccessible}
                onChange={(e) => setRequireAccessible(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-white"
              />
              <span className="font-medium">Wheelchair Accessible Routes Only</span>
            </label>

            <div className="flex gap-3 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={calculateRoute}
                disabled={!startNode || !endNode}
                className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Route className="w-5 h-5" />
                Find Route
              </motion.button>

              {(startNode || endNode || path) && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearRoute}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl
                           transition-all duration-300"
                >
                  Clear
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <InteractiveMap
                nodes={nodes}
                path={path}
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
              />
            </div>

            {path && (
              <RoutePanel path={path} isCalculating={isCalculating} />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            <PopularDestinations
              destinations={popularDests}
              onSelect={(node) => setEndNode(node)}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6" />
                <h3 className="text-xl font-bold">Navigation Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Total Nodes</span>
                  <span className="text-2xl font-bold">{nodes.filter(n => n.isActive).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Buildings</span>
                  <span className="text-2xl font-bold">{buildings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Routes Available</span>
                  <span className="text-2xl font-bold">{edges.filter(e => e.isActive).length}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <AdminPanel
        nodes={nodes}
        buildings={buildings}
        onAddNode={handleAddNode}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
      />

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-gray-900 text-gray-300 py-8 mt-12"
      >
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            Real-time Navigation Assistant • Powered by Advanced Pathfinding Algorithms
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Optimized for accessibility and user experience
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
