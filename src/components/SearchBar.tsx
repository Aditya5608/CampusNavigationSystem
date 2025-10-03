import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { NavigationNode } from '../types/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  nodes: NavigationNode[];
  onSearch: (query: string) => NavigationNode[];
  onNodeSelect: (node: NavigationNode) => void;
  placeholder: string;
  value: NavigationNode | null;
}

export default function SearchBar({ nodes, onSearch, onNodeSelect, placeholder, value }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NavigationNode[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.name);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.trim()) {
      const searchResults = onSearch(newQuery);
      setResults(searchResults.slice(0, 6));
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectNode = (node: NavigationNode) => {
    onNodeSelect(node);
    setQuery(node.name);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectNode(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const getNodeIcon = (type: string) => {
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl
                   focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                   transition-all duration-300 text-gray-900 placeholder-gray-400
                   shadow-lg hover:shadow-xl"
        />
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="max-h-80 overflow-y-auto">
              {results.map((node, index) => (
                <motion.button
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectNode(node)}
                  className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-blue-50
                           transition-colors duration-200 text-left
                           ${index === selectedIndex ? 'bg-blue-50' : ''}
                           ${index !== results.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="mt-1 text-blue-600">
                    {getNodeIcon(node.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {node.name}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {node.description}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        Floor {node.floor}
                      </span>
                      {node.isAccessible && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          Accessible
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
