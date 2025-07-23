import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, List, ExternalLink } from 'lucide-react';
import { SharedList, SharedListItem } from '../types';

interface SharedListViewProps {
  listId: string;
}

const priorityColors = {
  low: 'bg-blue-50 border-blue-200 text-blue-800',
  high: 'bg-red-50 border-red-200 text-red-800',
};

const priorityIcons = {
  low: Clock,
  high: AlertCircle,
};

export function SharedListView({ listId }: SharedListViewProps) {
  const [list, setList] = useState<SharedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'to-buy' | 'bought'>('to-buy');

  useEffect(() => {
    loadSharedList();
  }, [listId]);

  const loadSharedList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get from localStorage (in a real app, this would be an API call)
      const savedLists = localStorage.getItem('sharedLists');
      if (savedLists) {
        const lists: SharedList[] = JSON.parse(savedLists);
        const foundList = lists.find(l => l.id === listId);
        
        if (foundList) {
          setList(foundList);
        } else {
          setError('List not found');
        }
      } else {
        setError('List not found');
      }
    } catch (err) {
      setError('Failed to load list');
      console.error('Error loading shared list:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemStatus = (itemId: string) => {
    if (!list) return;

    const updatedItems = list.items.map(item => 
      item.id === itemId 
        ? { ...item, status: item.status === 'bought' ? 'to-buy' : 'bought' as 'to-buy' | 'bought' }
        : item
    );

    const updatedList = { ...list, items: updatedItems };
    setList(updatedList);

    // Update localStorage
    try {
      const savedLists = localStorage.getItem('sharedLists');
      if (savedLists) {
        const lists: SharedList[] = JSON.parse(savedLists);
        const updatedLists = lists.map(l => l.id === listId ? updatedList : l);
        localStorage.setItem('sharedLists', JSON.stringify(updatedLists));
      }
    } catch (err) {
      console.error('Failed to update list:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E5E9ED' }}>
        <div className="text-lg">Loading list...</div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E5E9ED' }}>
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error || 'List not found'}</div>
          <a 
            href="/"
            className="text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Go to FamilyCart
          </a>
        </div>
      </div>
    );
  }

  const filteredItems = list.items.filter(item => item.status === activeTab);
  const stats = {
    total: list.items.length,
    bought: list.items.filter(item => item.status === 'bought').length,
    toBuy: list.items.filter(item => item.status === 'to-buy').length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E5E9ED' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <List className="h-8 w-8 text-emerald-600" />
                <h1 className="text-xl font-bold text-gray-700">{list.name}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Go to FamilyCart</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('to-buy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'to-buy'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              To Buy ({stats.toBuy})
            </button>
            <button
              onClick={() => setActiveTab('bought')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bought'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bought ({stats.bought})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'to-buy' ? 'No items to buy' : 'No items bought yet'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'to-buy' 
                ? 'All items in this list have been completed!' 
                : 'Start checking off items as you buy them.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const PriorityIcon = priorityIcons[item.priority];

                return (
                  <div
                    key={item.id}
                    className={`p-4 transition-all duration-200 hover:bg-gray-50 ${
                      item.status === 'bought' ? 'opacity-75 bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Status Toggle */}
                      <button
                        onClick={() => toggleItemStatus(item.id)}
                        className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.status === 'bought'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 hover:border-emerald-500'
                        }`}
                      >
                        {item.status === 'bought' && <Check className="h-4 w-4" />}
                      </button>

                      {/* Item Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-lg font-medium ${
                              item.status === 'bought' ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </h4>
                            
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">
                                Qty: {item.quantity}
                              </span>
                              
                              {item.priority === 'high' && (
                                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[item.priority]}`}>
                                  <PriorityIcon className="h-3 w-3" />
                                  <span>Urgent</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}