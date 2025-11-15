import React from 'react';
import { Plus, UtensilsCrossed, Car, Coffee } from 'lucide-react';

interface SpendingsPanelProps {
  onAddSpending: (category: string) => void;
}

export function SpendingsPanel({ onAddSpending }: SpendingsPanelProps) {
  const categories = [
    { id: 'add', label: 'Add', icon: Plus, color: 'blue' },
    { id: 'food', label: 'Food', icon: UtensilsCrossed, color: 'blue' },
    { id: 'taxi', label: 'Taxi', icon: Car, color: 'blue' },
    { id: 'coffee', label: 'Coffee', icon: Coffee, color: 'blue' },
  ];

  return (
    <div className="w-48 h-full bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-3 shadow-sm">
      <div className="mb-2">
        <h3 className="text-sm text-gray-400 tracking-wider uppercase">Control</h3>
      </div>
      
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => onAddSpending(category.id)}
            className="flex items-center gap-3 px-3 py-3 bg-black border border-gray-800 hover:border-blue-600 hover:bg-gray-950 rounded-lg transition-all duration-300 group"
          >
            <div className="p-1.5 bg-gray-800 group-hover:bg-blue-600 rounded transition-all duration-300">
              <Icon size={16} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
