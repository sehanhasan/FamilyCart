import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ShoppingCart, Search } from 'lucide-react';
import { GroceryList } from './components/GroceryList';
import { AddItemsPage } from './components/AddItemsPage';
import { EditItemModal } from './components/EditItemModal';
import { DuplicateModal } from './components/DuplicateModal';
import { useSupabaseData } from './hooks/useSupabaseData';
import { GroceryItem, User as UserType } from './types';

function App() {
  const { users, items, loading, updating, error, addItem: addItemToDb, addMultipleItems: addMultipleItemsToDb, updateItem: updateItemInDb, deleteItem: deleteItemFromDb, clearBoughtItems: clearBoughtItemsFromDb } = useSupabaseData();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'to-buy' | 'bought'>('to-buy');
  const [currentPage, setCurrentPage] = useState<'main' | 'add-items'>('main');
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [duplicateItems, setDuplicateItems] = useState<{ newItem: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'> & { addedBy: string }; existingItem: GroceryItem }[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Move all useMemo calls before conditional returns
  const filteredByTab = items.filter(item => item.status === activeTab.replace('-', '-') as 'to-buy' | 'bought');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return filteredByTab;
    return filteredByTab.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [filteredByTab, searchTerm]);

  const stats = useMemo(() => {
    const total = items.length;
    const bought = items.filter(item => item.status === 'bought').length;
    const toBuy = total - bought;
    return { total, bought, toBuy };
  }, [items]);

  // Set current user to first user when users are loaded
  useEffect(() => {
    if (users.length > 0 && !currentUser) {
      setCurrentUser(users[0]);
    }
  }, [users, currentUser]);

  // Show loading state
  if (loading || !currentUser) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg text-red-600">Error: {error}</div></div>;

  const addItem = (newItem: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'>) => {
    // Check for duplicates
    const existingItem = items.find(item => 
      item.name.toLowerCase() === newItem.name.toLowerCase() && 
      item.status === 'to-buy'
    );
    
    if (existingItem) {
      setDuplicateItems([{ newItem: { ...newItem, addedBy: currentUser.id }, existingItem }]);
      setShowDuplicateModal(true);
      return;
    }

    const itemToAdd = {
      ...newItem,
      addedBy: currentUser.id,
    };
    
    addItemToDb(itemToAdd).then(() => {
      console.log('Item added and data refreshed');
    }).catch(error => {
      console.error('Failed to add item:', error);
      // You could add a toast notification here
    });
  };

  const addMultipleItems = (newItems: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'>[], addedBy: string) => {
    // Check for duplicates
    const duplicates: { newItem: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'> & { addedBy: string }; existingItem: GroceryItem }[] = [];
    const uniqueItems: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'>[] = [];

    newItems.forEach(newItem => {
      const existingItem = items.find(item => 
        item.name.toLowerCase() === newItem.name.toLowerCase() && 
        item.status === 'to-buy'
      );
      
      if (existingItem) {
        duplicates.push({ newItem: { ...newItem, addedBy }, existingItem });
      } else {
        uniqueItems.push(newItem);
      }
    });

    // Add unique items immediately
    if (uniqueItems.length > 0) {
      const itemsToAdd = uniqueItems.map(newItem => ({
        ...newItem,
        addedBy,
      }));
      
      addMultipleItemsToDb(itemsToAdd, addedBy).then(() => {
        console.log('Multiple items added and data refreshed');
      }).catch(error => {
        console.error('Failed to add multiple items:', error);
        // You could add a toast notification here
      });
    }

    // Handle duplicates
    if (duplicates.length > 0) {
      setDuplicateItems(duplicates);
      setShowDuplicateModal(true);
    }
  };

  const addMultipleItemsOld = (newItems: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'>[], addedBy: string) => {
    const itemsToAdd = newItems.map((newItem, index) => ({
      ...newItem,
      id: (Date.now() + index).toString(),
      createdAt: new Date().toISOString(),
      addedBy: addedBy,
    }));
    
    setItems(prev => [...prev, ...itemsToAdd]);
    
    const user = users.find(u => u.id === addedBy) || currentUser;
    addNotification({
      id: Date.now().toString(),
      type: 'item_added',
      message: `${user.name} added ${itemsToAdd.length} item(s) to the grocery list`,
      userId: addedBy,
      timestamp: new Date().toISOString(),
      isRead: false,
    });
  };

  const handleDuplicateDecision = (decision: 'merge' | 'skip' | 'add-anyway', duplicateIndex: number) => {
    const duplicate = duplicateItems[duplicateIndex];
    
    if (decision === 'merge') {
      // Merge quantities and update priority if new item has higher priority
      const priorityOrder = { low: 0, high: 1 };
      const newPriority = priorityOrder[duplicate.newItem.priority] > priorityOrder[duplicate.existingItem.priority] 
        ? duplicate.newItem.priority 
        : duplicate.existingItem.priority;
      
      updateItemInDb(duplicate.existingItem.id, {
        quantity: `${duplicate.existingItem.quantity} + ${duplicate.newItem.quantity}`,
        priority: newPriority,
      }).then(() => {
        console.log('Item merged and data refreshed');
      }).catch(error => {
        console.error('Failed to merge item:', error);
        // You could add a toast notification here
      });
    } else if (decision === 'add-anyway') {
      // Add as new item
      const itemToAdd = {
        ...duplicate.newItem,
        addedBy: duplicate.newItem.addedBy,
      };
      addItemToDb(itemToAdd).then(() => {
        console.log('Duplicate item added and data refreshed');
      }).catch(error => {
        console.error('Failed to add duplicate item:', error);
        // You could add a toast notification here
      });
    }
    // For 'skip', we do nothing
    
    // Remove this duplicate from the list
    setDuplicateItems(prev => prev.filter((_, index) => index !== duplicateIndex));
  };

  const updateItem = (id: string, updates: Partial<GroceryItem>) => {
    updateItemInDb(id, updates).then(() => {
      console.log('Item updated and data refreshed');
    }).catch(error => {
      console.error('Failed to update item:', error);
      // You could add a toast notification here
    });
  };

  const deleteItem = (id: string) => {
    deleteItemFromDb(id).then(() => {
      console.log('Item deleted and data refreshed');
    }).catch(error => {
      console.error('Failed to delete item:', error);
      // You could add a toast notification here
    });
  };

  const handleVoiceInput = (transcript: string) => {
  };

  const clearBoughtItems = () => {
    clearBoughtItemsFromDb().then(() => {
      console.log('Bought items cleared and data refreshed');
    }).catch(error => {
      console.error('Failed to clear bought items:', error);
      // You could add a toast notification here
    });
  };

  if (currentPage === 'add-items') {
    return (
      <AddItemsPage
        users={users}
        currentUser={currentUser}
        existingItems={items}
        updating={updating}
        onAddItems={addMultipleItems}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${updating ? 'opacity-75 pointer-events-none' : ''}`}>
      {/* Loading Overlay */}
      {updating && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span className="text-gray-700">Updating...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-emerald-600" />
                <h1 className="text-xl font-bold text-gray-700">FamilyCart</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
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

        {/* Search Bar (when toggled) */}
        {showSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                autoFocus
              />
            </div>
          </div>
        )}


        {/* Grocery List */}
        <GroceryList
          items={filteredItems}
          users={users}
          currentUser={currentUser}
          updating={updating}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onEditItem={setEditingItem}
          onClearBought={clearBoughtItems}
          activeTab={activeTab}
        />

        {/* Floating Add Button */}
        <button
          onClick={() => setCurrentPage('add-items')}
          className={`fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 hover:scale-110 flex items-center justify-center z-40 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={updating}
        >
          <Plus className="h-6 w-6" />
        </button>
      </main>

      {/* Modals */}
      {editingItem && (
        <EditItemModal
          onClose={() => setEditingItem(null)}
          onUpdateItem={(updatedItem) => {
            updateItem(editingItem.id, updatedItem);
            setEditingItem(null);
          }}
          existingItems={items}
          editingItem={editingItem}
        />
      )}

      {showDuplicateModal && duplicateItems.length > 0 && (
        <DuplicateModal
          duplicates={duplicateItems}
          onDecision={handleDuplicateDecision}
          onClose={() => {
            setShowDuplicateModal(false);
            setDuplicateItems([]);
          }}
        />
      )}
    </div>
  );
}

export default App;