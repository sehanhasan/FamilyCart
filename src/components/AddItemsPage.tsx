import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { GroceryItem, User } from '../types';

interface AddItemsPageProps {
  users: User[];
  currentUser: User;
  existingItems: GroceryItem[];
  updating?: boolean;
  onAddItems: (items: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'>[], addedBy: string) => void;
  onBack: () => void;
}

interface ItemForm {
  name: string;
  quantity: string;
  isHighPriority: boolean;
}

export function AddItemsPage({ users, currentUser, existingItems, updating = false, onAddItems, onBack }: AddItemsPageProps) {
  const [selectedUser, setSelectedUser] = useState(currentUser.id);
  const [items, setItems] = useState<ItemForm[]>([
    { name: '', quantity: '1', isHighPriority: false }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
    setSuggestions(allItems);
  }, [existingItems]);

  const addNewItem = () => {
    setItems([...items, { name: '', quantity: '', isHighPriority: false }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItemForm, value: string | number | boolean) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(item => item.name.trim());
    
    if (validItems.length === 0) return;

    const itemsToAdd = validItems.map(item => ({
      name: item.name.trim(),
      quantity: item.quantity.trim() || '1',
      priority: item.isHighPriority ? 'high' : 'medium',
      status: 'to-buy' as const,
      category: 'Groceries',
    }));

    onAddItems(itemsToAdd, selectedUser);
    onBack();
  };

  const getFilteredSuggestions = (inputValue: string) => {
    if (inputValue.length === 0) return [];
    return suggestions
      .filter(item => 
        item.toLowerCase().includes(inputValue.toLowerCase()) &&
        item.toLowerCase() !== inputValue.toLowerCase()
      )
      .slice(0, 5);
  };

  const selectedUserData = users.find(u => u.id === selectedUser) || currentUser;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E5E9ED' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-2 ml-6">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
              <h1 className="text-xl font-semibold text-gray-900">Add New Items</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">From</h2>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Items to Add</h2>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => {
                const filteredSuggestions = getFilteredSuggestions(item.name);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Item Name with Suggestions */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter item name..."
                        required
                        autoComplete="off"
                      />
                      
                      {/* Suggestions Dropdown */}
                      {filteredSuggestions.length > 0 && item.name.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10 max-h-40 overflow-y-auto">
                          {filteredSuggestions.map((suggestion, suggestionIndex) => (
                            <button
                              key={suggestionIndex}
                              type="button"
                              onClick={() => updateItem(index, 'name', suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity and Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="e.g. 2, 1kg, 500g"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          &nbsp;
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isHighPriority}
                            onChange={(e) => updateItem(index, 'isHighPriority', e.target.checked)}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Mark as Urgent</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Add Another Item Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={addNewItem}
                className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Another Item</span>
              </button>
            </div>
          </div>

          {/* Group Comments */}
          {/* Submit Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className={`px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={updating}
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Add {items.filter(item => item.name.trim()).length} Item(s)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}