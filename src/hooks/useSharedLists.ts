import { useState } from 'react';
import { SharedList, SharedListItem } from '../types';

export function useSharedLists() {
  const [creating, setCreating] = useState(false);

  const createSharedList = async (name: string, items: Omit<SharedListItem, 'id' | 'createdAt'>[]): Promise<string> => {
    setCreating(true);
    
    try {
      // Generate unique ID
      const listId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create list items with IDs
      const listItems: SharedListItem[] = items.map((item, index) => ({
        ...item,
        id: `item_${Date.now()}_${index}`,
        createdAt: new Date().toISOString(),
      }));

      // Create the shared list
      const sharedList: SharedList = {
        id: listId,
        name,
        items: listItems,
        createdAt: new Date().toISOString(),
        shareUrl: `${window.location.origin}/list/${listId}`,
      };

      // Save to localStorage (in a real app, this would be saved to a database)
      const existingLists = localStorage.getItem('sharedLists');
      const lists: SharedList[] = existingLists ? JSON.parse(existingLists) : [];
      lists.push(sharedList);
      localStorage.setItem('sharedLists', JSON.stringify(lists));

      return sharedList.shareUrl;
    } catch (error) {
      console.error('Error creating shared list:', error);
      throw new Error('Failed to create list. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return {
    createSharedList,
    creating,
  };
}