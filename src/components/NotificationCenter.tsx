import React from 'react';
import { X, Bell, ShoppingCart, Plus } from 'lucide-react';
import { Notification, User } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  users: User[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export function NotificationCenter({ notifications, users, onClose, onMarkAsRead }: NotificationCenterProps) {
  const getUserById = (id: string) => users.find(user => user.id === id);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'item_added':
        return <Plus className="h-5 w-5 text-emerald-600" />;
      case 'item_bought':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You'll see updates here when items are added or bought.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedNotifications.map((notification) => {
                const user = getUserById(notification.userId);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {user && (
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium text-xs"
                              style={{ backgroundColor: user.color }}
                            >
                              {user.name.charAt(0)}
                            </div>
                          )}
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-900 mt-1">{notification.message}</p>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {notifications.filter(n => !n.isRead).length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                notifications.forEach(n => !n.isRead && onMarkAsRead(n.id));
              }}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              Mark All as Read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}