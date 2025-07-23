import React from 'react';
import { Check, Edit3, Trash2, Clock, AlertCircle } from 'lucide-react';
import { GroceryItem, User } from '../types';

interface GroceryListProps {
  items: GroceryItem[];
  users: User[];
  currentUser: User;
  updating: boolean;
  onUpdateItem: (id: string, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: GroceryItem) => void;
  onClearBought: () => void;
  activeTab: 'to-buy' | 'bought';
}

const priorityColors = {
  low: 'bg-blue-50 border-blue-200 text-blue-800',
  high: 'bg-red-50 border-red-200 text-red-800',
};

const priorityIcons = {
  low: Clock,
  high: AlertCircle,
};

export function GroceryList({ items, users, currentUser, updating, onUpdateItem, onDeleteItem, onEditItem, onClearBought, activeTab }: GroceryListProps) {
  const getUserById = (id: string) => users.find(user => user.id === id);

  const toggleStatus = (item: GroceryItem) => {
    const newStatus = item.status === 'bought' ? 'to-buy' : 'bought';
    onUpdateItem(item.id, { 
      status: newStatus,
      boughtBy: newStatus === 'bought' ? currentUser.id : undefined,
      boughtAt: newStatus === 'bought' ? new Date().toISOString() : undefined,
    });
  };

  // Group items by user
  const groupedByUser = items.reduce((groups, item) => {
    const userId = item.addedBy;
    if (!groups[userId]) {
      groups[userId] = [];
    }
    groups[userId].push(item);
    return groups;
  }, {} as Record<string, GroceryItem[]>);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
        <p className="text-gray-500">Start by adding some items to your grocery list!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByUser).map(([userId, userItems]) => {
        const user = getUserById(userId);
        if (!user) return null;

        // Sort items within each user group
        const sortedItems = userItems.sort((a, b) => {
          // Sort by status (to-buy first), then by priority, then by creation date
          if (a.status !== b.status) {
            return a.status === 'to-buy' ? -1 : 1;
          }
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          if (a.priority !== b.priority) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return (
          <div key={userId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* User Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{userItems.length} item(s)</p>
                  </div>
                </div>
                {activeTab === 'bought' && userItems.length > 0 && (
                  <button
                    onClick={onClearBought}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
                  >
                    Clear All
                  </button> 
                )} 
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-200">
              {sortedItems.map((item) => {
                const boughtBy = item.boughtBy ? getUserById(item.boughtBy) : null;
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
                        onClick={() => toggleStatus(item)}
                        className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.status === 'bought'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 hover:border-emerald-500'
                        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                              <span className="text-m text-gray-500">
                                Qty: {item.quantity}
                              </span>
                              
                              {item.priority === 'high' && (
                                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[item.priority]}`}>
                                  <PriorityIcon className="h-3 w-3" />
                                  <span>Urgent</span>
                                </div>
                              )}
                            </div>

                            {/* Meta Information */}
                            {/* {boughtBy && (
                              <div className="mt-3 text-xs text-gray-500">
                                <span>Bought by {boughtBy.name}</span>
                              </div>
                            )} */} 
                          </div>

                          {/* Actions */}
                          {activeTab === 'to-buy' && (
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => onEditItem(item)}
                                className={`p-1.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-50 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={updating}
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className={`p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={updating}
                              >
                                {updating ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-red-400"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
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
        );
      })}
    </div>
  );
}