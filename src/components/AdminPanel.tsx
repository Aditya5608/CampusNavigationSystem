import { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, MapPin, Settings, X } from 'lucide-react';
import { NavigationNode, Building } from '../types/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminPanelProps {
  nodes: NavigationNode[];
  buildings: Building[];
  onAddNode: (node: Omit<NavigationNode, 'id'>) => void;
  onUpdateNode: (id: string, node: Partial<NavigationNode>) => void;
  onDeleteNode: (id: string) => void;
}

export default function AdminPanel({ nodes, buildings, onAddNode, onUpdateNode, onDeleteNode }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [editingNode, setEditingNode] = useState<NavigationNode | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    buildingId: buildings[0]?.id || '',
    type: 'room' as NavigationNode['type'],
    floor: 1,
    latitude: 40.7589,
    longitude: -73.9851,
    description: '',
    isAccessible: true,
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNode) {
      onUpdateNode(editingNode.id, formData);
      setEditingNode(null);
    } else {
      onAddNode(formData);
    }
    setIsAddingNode(false);
    setFormData({
      name: '',
      buildingId: buildings[0]?.id || '',
      type: 'room',
      floor: 1,
      latitude: 40.7589,
      longitude: -73.9851,
      description: '',
      isAccessible: true,
      isActive: true
    });
  };

  const handleEdit = (node: NavigationNode) => {
    setEditingNode(node);
    setFormData({
      name: node.name,
      buildingId: node.buildingId,
      type: node.type,
      floor: node.floor,
      latitude: node.latitude,
      longitude: node.longitude,
      description: node.description,
      isAccessible: node.isAccessible,
      isActive: node.isActive
    });
    setIsAddingNode(true);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-600 to-blue-700
                 text-white rounded-full shadow-2xl hover:shadow-blue-500/50
                 hover:scale-110 transition-all duration-300 z-50"
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Node Management</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <button
                  onClick={() => setIsAddingNode(true)}
                  className="w-full mb-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600
                           text-white rounded-xl font-semibold flex items-center justify-center gap-2
                           hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Add New Node
                </button>

                {isAddingNode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 bg-gray-50 rounded-xl p-6"
                  >
                    <h3 className="font-bold text-lg mb-4">
                      {editingNode ? 'Edit Node' : 'Create New Node'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Building
                          </label>
                          <select
                            value={formData.buildingId}
                            onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {buildings.map(building => (
                              <option key={building.id} value={building.id}>
                                {building.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as NavigationNode['type'] })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="room">Room</option>
                            <option value="entrance">Entrance</option>
                            <option value="intersection">Intersection</option>
                            <option value="elevator">Elevator</option>
                            <option value="stairs">Stairs</option>
                            <option value="restroom">Restroom</option>
                            <option value="exit">Exit</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Floor
                          </label>
                          <input
                            type="number"
                            value={formData.floor}
                            onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.isAccessible}
                            onChange={(e) => setFormData({ ...formData, isAccessible: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Wheelchair Accessible</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                                   hover:bg-blue-700 transition-colors"
                        >
                          {editingNode ? 'Update Node' : 'Create Node'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNode(false);
                            setEditingNode(null);
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold
                                   hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {nodes.map(node => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{node.name}</div>
                          <div className="text-sm text-gray-600">
                            Floor {node.floor} • {node.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(node)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteNode(node.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
