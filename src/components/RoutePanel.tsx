import { Clock, Navigation2, MapPin, Accessibility, TrendingUp } from 'lucide-react';
import { PathResult, NavigationNode } from '../types/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface RoutePanelProps {
  path: PathResult | null;
  isCalculating: boolean;
}

const getStepDirection = (current: NavigationNode, next: NavigationNode): string => {
  if (current.floor !== next.floor) {
    if (current.floor < next.floor) {
      return `Take elevator/stairs to floor ${next.floor}`;
    } else {
      return `Take elevator/stairs down to floor ${next.floor}`;
    }
  }
  return `Walk to ${next.name}`;
};

export default function RoutePanel({ path, isCalculating }: RoutePanelProps) {
  if (isCalculating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Calculating optimal route...</span>
        </div>
      </motion.div>
    );
  }

  if (!path) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Navigation2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Route Found</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs opacity-90">Distance</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(path.totalDistance)}m</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs opacity-90">Time</span>
              </div>
              <div className="text-2xl font-bold">{path.estimatedTime}s</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs opacity-90">Steps</span>
              </div>
              <div className="text-2xl font-bold">{path.nodes.length}</div>
            </motion.div>
          </div>

          {path.isAccessible && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-3 py-2 rounded-lg"
            >
              <Accessibility className="w-5 h-5" />
              <span className="text-sm font-medium">Wheelchair Accessible Route</span>
            </motion.div>
          )}
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Step-by-Step Directions
          </h3>

          <div className="space-y-3">
            {path.nodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex gap-4 group"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * index + 0.2 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                             ${index === 0
                                ? 'bg-green-500 text-white'
                                : index === path.nodes.length - 1
                                ? 'bg-red-500 text-white'
                                : 'bg-blue-500 text-white'
                              }`}
                  >
                    {index + 1}
                  </motion.div>
                  {index < path.nodes.length - 1 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ delay: 0.1 * index + 0.3 }}
                      className="w-0.5 bg-gradient-to-b from-blue-300 to-blue-100 flex-1 min-h-8"
                    />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <div className="font-semibold text-gray-900">{node.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{node.description}</div>
                    {index < path.nodes.length - 1 && (
                      <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                        <Navigation2 className="w-4 h-4" />
                        {getStepDirection(node, path.nodes[index + 1])}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        Floor {node.floor}
                      </span>
                      {index === 0 && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Start
                        </span>
                      )}
                      {index === path.nodes.length - 1 && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          Destination
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
