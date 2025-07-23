import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { GroceryItem } from '../types';

interface EditItemModalProps {
  onClose: () => void;
  onUpdateItem: (item: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'>) => void;
  existingItems: GroceryItem[];
  editingItem: GroceryItem;
}

export function EditItemModal({ onClose, onUpdateItem, existingItems, editingItem }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    name: editingItem.name,
    quantity: editingItem.quantity,
    isHighPriority: editingItem.priority === 'high',
    status: editingItem.status,
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate suggestions based on existing items and common grocery items
  useEffect(() => {
    const commonItems = [
      'Milk', 'Bread', 'Eggs', 'Butter', 'Cheese', 'Yogurt', 'Bananas', 'Apples', 
      'Oranges', 'Tomatoes', 'Onions', 'Garlic', 'Carrots', 'Potatoes', 'Chicken',
      'Ground Beef', 'Salmon', 'Rice', 'Pasta', 'Olive Oil', 'Salt', 'Pepper',
      'Cereal', 'Orange Juice', 'Coffee', 'Tea', 'Sugar', 'Flour', 'Paper Towels',
    ];

    const existingItemNames = existingItems.map(item => item.name);
    const allItems = [...new Set([...existingItemNames, ...commonItems])];
    
    if (formData.name.length > 0) {
      const filtered = allItems
        .filter(item => 
          item.toLowerCase().includes(formData.name.toLowerCase()) &&
          item.toLowerCase() !== formData.name.toLowerCase()
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.name, existingItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onUpdateItem({
      ...formData,
      quantity: formData.quantity.trim() || '1',
      priority: formData.isHighPriority ? 'high' : 'medium',
      category: 'Groceries',
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData({ ...formData, name: suggestion });
    setShowSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter item name..."
              required
              autoComplete="off"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10 max-h-40 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. 2, 1kg, 500g"
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.isHighPriority}
                  onChange={(e) => setFormData({ ...formData, isHighPriority: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Mark as Urgent</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Update Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}