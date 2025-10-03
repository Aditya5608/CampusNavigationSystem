import { NavigationNode } from '../types/navigation';
import { TrendingUp, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface PopularDestinationsProps {
  destinations: { node: NavigationNode; searchCount: number }[];
  onSelect: (node: NavigationNode) => void;
}

export default function PopularDestinations({ destinations, onSelect }: PopularDestinationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Popular Destinations</h2>
      </div>

      <div className="space-y-3">
        {destinations.map((destination, index) => (
          <motion.button
            key={destination.node.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => onSelect(destination.node)}
            className="w-full bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-blue-100
                     border border-gray-200 hover:border-blue-300 rounded-xl p-4
                     transition-all duration-300 text-left group shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {destination.node.name}
                </div>
                <div className="text-sm text-gray-600 mt-1 truncate">
                  {destination.node.description}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    Floor {destination.node.floor}
                  </span>
                  <span className="text-xs text-gray-500">
                    {destination.searchCount} searches
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
