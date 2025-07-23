export interface User {
  id: string;
  name: string;
  color: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  priority: 'low' | 'high';
  status: 'to-buy' | 'bought';
  createdAt: string;
  addedBy: string;
  boughtBy?: string;
  boughtAt?: string;
}

export interface Notification {
  id: string;
  type: 'item_added' | 'item_bought' | 'list_shared';
  message: string;
  userId: string;
  timestamp: string;
  isRead: boolean;
}

export interface SharedList {
  id: string;
  name: string;
  items: SharedListItem[];
  createdAt: string;
  shareUrl: string;
}

export interface SharedListItem {
  id: string;
  name: string;
  quantity: string;
  priority: 'low' | 'high';
  status: 'to-buy' | 'bought';
  createdAt: string;
}