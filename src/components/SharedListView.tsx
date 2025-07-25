import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, List, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SharedList, SharedListItem } from '../types';
import { EditItemModal } from './EditItemModal';

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
  const [editingItem, setEditingItem] = useState<SharedListItem | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSharedList();
  }, [listId]);

  // Update page title when list is loaded
  useEffect(() => {
    if (list) {
      document.title = `${list.name} - Shared List`;
    }
    return () => {
      document.title = 'FamilyCart - Grocery Management App';
    };
  }, [list]);

  const loadSharedList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get list details from database
      const { data: listData, error: listError } = await supabase
        .from('shared_lists')
        .select('*')
        .eq('id', listId)
        .maybeSingle();

      if (listError) {
        throw listError;
        return;
      }

      if (!listData) {
        setError('List not found');
        return;
      }

      // Get list items from database
      const { data: itemsData, error: itemsError } = await supabase
        .from('shared_list_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at');

      if (itemsError) throw itemsError;

      // Transform data to match our types
      const transformedItems: SharedListItem[] = (itemsData || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        priority: item.priority as 'low' | 'high',
        status: item.status as 'to-buy' | 'bought',
        createdAt: item.created_at,
      }));

      const sharedList: SharedList = {
        id: listData.id,
        name: listData.name,
        items: transformedItems,
        createdAt: listData.created_at,
        shareUrl: listData.share_url,
      };

      setList(sharedList);
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

    // Update database
    try {
      const item = updatedItems.find(i => i.id === itemId);
      if (item) {
        supabase
          .from('shared_list_items')
          .update({ status: item.status })
          .eq('id', itemId)
          .then(({ error }) => {
            if (error) {
              console.error('Failed to update item status:', error);
              // Revert the local change if database update fails
              loadSharedList();
            }
          });
      }
    } catch (err) {
      console.error('Failed to update list:', err);
      // Revert the local change if update fails
      loadSharedList();
    }
  };

  const updateItem = async (itemId: string, updates: Partial<SharedListItem>) => {
    if (!list) return;

    setUpdating(true);
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { error } = await supabase
        .from('shared_list_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      const updatedItems = list.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      setList({ ...list, items: updatedItems });
    } catch (err) {
      console.error('Failed to update item:', err);
      // Reload data on error
      loadSharedList();
    } finally {
      setUpdating(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!list) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('shared_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      const updatedItems = list.items.filter(item => item.id !== itemId);
      setList({ ...list, items: updatedItems });
    } catch (err) {
      console.error('Failed to delete item:', err);
      // Reload data on error
      loadSharedList();
    } finally {
      setUpdating(false);
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
                    className={`p-4 transition-all duration-200 hover:bg-gray-50 ${updating ? 'opacity-50' : ''} ${
                      item.status === 'bought' ? 'opacity-75 bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Status Toggle */}
                      <button
                        onClick={() => toggleItemStatus(item.id)}
                        className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${updating ? 'opacity-50 cursor-not-allowed' : ''} ${
                          item.status === 'bought'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 hover:border-emerald-500'
                        }`}
                        disabled={updating}
                      >
                        {updating ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                        ) : (
                          item.status === 'bought' && <Check className="h-4 w-4" />
                        )}
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

                          {/* Actions */}
                          {activeTab === 'to-buy' && (
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => setEditingItem(item)}
                                className={`p-1.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-50 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={updating}
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className={`p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={updating}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
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

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          onClose={() => setEditingItem(null)}
          onUpdateItem={(updatedItem) => {
            updateItem(editingItem.id, {
              name: updatedItem.name,
              quantity: updatedItem.quantity,
              priority: updatedItem.priority,
            });
            setEditingItem(null);
          }}
          existingItems={list?.items.map(item => ({
            id: item.id,
            name: item.name,
            category: 'Groceries',
            quantity: item.quantity,
            priority: item.priority,
            status: item.status,
            createdAt: item.createdAt,
            addedBy: '',
          })) || []}
          editingItem={{
            id: editingItem.id,
            name: editingItem.name,
            category: 'Groceries',
            quantity: editingItem.quantity,
            priority: editingItem.priority,
            status: editingItem.status,
            createdAt: editingItem.createdAt,
            addedBy: '',
          }}
        />
      )}
    </div>
  );
}