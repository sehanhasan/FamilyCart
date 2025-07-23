import React from 'react';
import { X, AlertTriangle, Plus, Merge, SkipForward } from 'lucide-react';
import { GroceryItem } from '../types';

interface DuplicateModalProps {
  duplicates: { newItem: Omit<GroceryItem, 'id' | 'createdAt' | 'addedBy'>; existingItem: GroceryItem }[];
  onDecision: (decision: 'merge' | 'skip' | 'add-anyway', duplicateIndex: number) => void;
  onClose: () => void;
}

export function DuplicateModal({ duplicates, onDecision, onClose }: DuplicateModalProps) {
  const handleDecisionForAll = (decision: 'merge' | 'skip' | 'add-anyway') => {
    duplicates.forEach((_, index) => {
      onDecision(decision, index);
    });
    onClose();
  };

  const currentDuplicate = duplicates[0];
  const remainingCount = duplicates.length;

  if (!currentDuplicate) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">Duplicate Item Found</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            "{currentDuplicate.newItem.name}" already exists in your list. What would you like to do?
            {remainingCount > 1 && (
              <span className="block mt-1 text-sm text-gray-500">
                ({remainingCount} duplicate(s) remaining)
              </span>
            )}
          </p>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Existing Item</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Quantity:</span> {currentDuplicate.existingItem.quantity}</p>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">New Item</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Quantity:</span> {currentDuplicate.newItem.quantity}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onDecision('merge', 0)}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Merge className="h-4 w-4" />
              <span>Merge (Qty: {currentDuplicate.existingItem.quantity} + {currentDuplicate.newItem.quantity})</span>
            </button>
            
            <button
              onClick={() => onDecision('add-anyway', 0)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add as Separate Item</span>
            </button>
            
            <button
              onClick={() => onDecision('skip', 0)}
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <SkipForward className="h-4 w-4" />
              <span>Skip This Item</span>
            </button>
          </div>

          {/* Bulk Actions */}
          {remainingCount > 1 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Apply to all duplicates:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDecisionForAll('merge')}
                  className="text-xs bg-emerald-100 text-emerald-700 py-2 rounded hover:bg-emerald-200 transition-colors"
                >
                  Merge All
                </button>
                <button
                  onClick={() => handleDecisionForAll('add-anyway')}
                  className="text-xs bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 transition-colors"
                >
                  Add All
                </button>
                <button
                  onClick={() => handleDecisionForAll('skip')}
                  className="text-xs bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  Skip All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}