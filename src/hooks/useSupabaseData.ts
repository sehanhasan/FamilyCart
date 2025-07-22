import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GroceryItem, User } from '../types';

export function useSupabaseData() {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const itemsSubscription = supabase
      .channel('grocery_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'grocery_items' },
        () => {
          console.log('Grocery items changed, reloading...');
          loadItems();
        }
      )
      .subscribe();

    const usersSubscription = supabase
      .channel('users_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          console.log('Users changed, reloading...');
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      itemsSubscription.unsubscribe();
      usersSubscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadUsers(), loadItems()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at');

    if (error) throw error;
    setUsers(data || []);
    console.log('Users loaded:', data?.length || 0);
  };

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform database items to match app types
    const transformedItems: GroceryItem[] = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity_text || item.quantity?.toString() || '1',
      priority: item.priority as 'low' | 'high',
      status: item.status as 'to-buy' | 'bought',
      createdAt: item.created_at,
      addedBy: item.added_by,
      boughtBy: item.bought_by || undefined,
      boughtAt: item.bought_at || undefined,
    }));

    setItems(transformedItems);
    console.log('Items loaded:', transformedItems.length);
  };

  const addItem = async (newItem: Omit<GroceryItem, 'id' | 'createdAt'>) => {
    setUpdating(true);
    console.log('Adding item:', newItem.name);
    const { error } = await supabase
      .from('grocery_items')
      .insert({
        name: newItem.name,
        category: newItem.category,
        quantity_text: newItem.quantity,
        priority: newItem.priority,
        status: newItem.status,
        added_by: newItem.addedBy,
        bought_by: newItem.boughtBy || null,
        bought_at: newItem.boughtAt || null,
      });

    if (error) {
      console.error('Error adding item:', error);
      setUpdating(false);
      throw error;
    }
    console.log('Item added successfully');
    // Force reload after adding item
    await loadItems();
    setUpdating(false);
  };

  const addMultipleItems = async (newItems: Omit<GroceryItem, 'id' | 'createdAt'>[], addedBy: string) => {
    setUpdating(true);
    console.log('Adding multiple items:', newItems.length);
    const itemsToInsert = newItems.map(item => ({
      name: item.name,
      category: item.category,
      quantity_text: item.quantity,
      priority: item.priority,
      status: item.status,
      added_by: addedBy,
    }));

    const { error } = await supabase
      .from('grocery_items')
      .insert(itemsToInsert);

    if (error) {
      console.error('Error adding multiple items:', error);
      setUpdating(false);
      throw error;
    }
    console.log('Multiple items added successfully');
    // Force reload after adding multiple items
    await loadItems();
    setUpdating(false);
  };

  const updateItem = async (id: string, updates: Partial<GroceryItem>) => {
    setUpdating(true);
    console.log('Updating item:', id, updates);
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.quantity !== undefined) updateData.quantity_text = updates.quantity;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.boughtBy !== undefined) updateData.bought_by = updates.boughtBy;
    if (updates.boughtAt !== undefined) updateData.bought_at = updates.boughtAt;

    const { error } = await supabase
      .from('grocery_items')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating item:', error);
      setUpdating(false);
      throw error;
    }
    console.log('Item updated successfully');
    // Force reload after updating item
    await loadItems();
    setUpdating(false);
  };

  const deleteItem = async (id: string) => {
    setUpdating(true);
    console.log('Deleting item:', id);
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      setUpdating(false);
      throw error;
    }
    console.log('Item deleted successfully');
    // Force reload after deleting item
    await loadItems();
    setUpdating(false);
  };

  const clearBoughtItems = async () => {
    setUpdating(true);
    console.log('Clearing bought items');
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('status', 'bought');

    if (error) {
      console.error('Error clearing bought items:', error);
      setUpdating(false);
      throw error;
    }
    console.log('Bought items cleared successfully');
    // Force reload after clearing bought items
    await loadItems();
    setUpdating(false);
  };

  return {
    users,
    items,
    loading,
    updating,
    error,
    addItem,
    addMultipleItems,
    updateItem,
    deleteItem,
    clearBoughtItems,
    refetch: loadData,
  };
}