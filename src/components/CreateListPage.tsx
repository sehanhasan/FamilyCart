import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, List, Copy, Check } from 'lucide-react';
import { SharedListItem } from '../types';

interface CreateListPageProps {
  onBack: () => void;
  onCreateList: (name: string, items: Omit<SharedListItem, 'id' | 'createdAt'>[]) => Promise<string>;
}

interface ItemForm {
  name: string;
  quantity: string;
  isHighPriority: boolean;
}

export function CreateListPage({ onBack, onCreateList }: CreateListPageProps) {
  const [listName, setListName] = useState('');
  const [items, setItems] = useState<ItemForm[]>([
    { name: '', quantity: '1', isHighPriority: false }
  ]);
  const [creating, setCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Generate suggestions based on common grocery items
  React.useEffect(() => {
    const commonItems = [
      'Milk', 'Bread', 'Eggs', 'Butter', 'Cheese', 'Yogurt', 'Bananas', 'Apples', 
      'Oranges', 'Tomatoes', 'Onions', 'Garlic', 'Carrots', 'Potatoes', 'Chicken',
      'Ground Beef', 'Salmon', 'Rice', 'Pasta', 'Olive Oil', 'Salt', 'Pepper',
      'Cereal', 'Orange Juice', 'Coffee', 'Tea', 'Sugar', 'Flour', 'Paper Towels',
    ];
    setSuggestions(commonItems);
  }, []);

  const addNewItem = () => {
    setItems([...items, { name: '', quantity: '', isHighPriority: false }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItemForm, value: string | boolean) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!listName.trim()) {
      setError('Please enter a list name');
      return;
    }

    const validItems = items.filter(item => item.name.trim());
    
    if (validItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setCreating(true);

    try {
      const itemsToAdd = validItems.map(item => ({
        name: item.name.trim(),
        quantity: item.quantity.trim() || '1',
        priority: item.isHighPriority ? 'high' : 'low',
        status: 'to-buy' as const,
      }));

      const generatedShareUrl = await onCreateList(listName.trim(), itemsToAdd);
      setShareUrl(generatedShareUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
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

  // Success state - show share URL
  if (shareUrl) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#E5E9ED' }}>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="flex items-center space-x-2">
                <List className="h-6 w-6 text-emerald-600" />
                <h1 className="text-xl font-semibold text-gray-900">List Created Successfully!</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">"{listName}" Created!</h2>
              <p className="text-gray-600">Your list has been created and is ready to share.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share this link:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Back to FamilyCart
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                View List
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              <List className="h-6 w-6 text-emerald-600" />
              <h1 className="text-xl font-semibold text-gray-900">Create New List</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* List Name */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">List Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                List Name *
              </label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. Weekend Shopping, Party Supplies..."
                required
              />
            </div>
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

                  {/* Item Name */}
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label> */}
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter item name..."
                      required
                    />
                  </div>

                  {/* Quantity and Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative">
                      {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label> */}
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g. 2, 1kg, 500g"
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
                        autoComplete="off"
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
                          className="h-6 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className={`px-6 py-3 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={creating}
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <List className="h-5 w-5" />
                  <span>Create List</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}