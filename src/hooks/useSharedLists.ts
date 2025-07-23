import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SharedList, SharedListItem } from '../types';

export function useSharedLists() {
  const [creating, setCreating] = useState(false);

  const createSharedList = async (name: string, items: Omit<SharedListItem, 'id' | 'createdAt'>[]): Promise<string> => {
    setCreating(true);
    
    try {
      // Generate unique ID
      const listId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const shareUrl = `${window.location.origin}/list/${listId}`;
      
      // Insert the shared list into database
      const { error: listError } = await supabase
        .from('shared_lists')
        .insert({
          id: listId,
          name,
          share_url: shareUrl,
        });

      if (listError) throw listError;

      // Insert the list items into database
      const itemsToInsert = items.map(item => ({
        list_id: listId,
        name: item.name,
        quantity: item.quantity,
        priority: item.priority,
        status: item.status,
      }));

      const { error: itemsError } = await supabase
        .from('shared_list_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return shareUrl;
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