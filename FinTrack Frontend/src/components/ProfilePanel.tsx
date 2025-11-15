import React from 'react';
import { User, DollarSign, Target } from 'lucide-react';

interface ProfilePanelProps {
  onProfileAction: (action: string) => void;
  username?: string;
  budget?: number; // Budget in USD
  goal?: number; // Goal in USD
  currency?: 'USD' | 'AZN';
  convertToDisplayCurrency?: (amountUSD: number) => number;
  formatCurrency?: (amount: number) => string;
}

export function ProfilePanel({ 
  onProfileAction, 
  username = 'User', 
  budget = 0,
  goal = 0,
  currency = 'USD',
  convertToDisplayCurrency = (amount) => amount,
  formatCurrency = (amount) => `$${amount.toFixed(2)}`
}: ProfilePanelProps) {
  const displayBudget = convertToDisplayCurrency(budget);
  const displayGoal = convertToDisplayCurrency(goal);
  const actions = [
    { id: 'username', label: 'Username', icon: User, color: 'blue', value: username },
    { id: 'budget', label: 'Budget', icon: DollarSign, color: 'blue', value: formatCurrency(displayBudget) },
    { id: 'goal', label: 'Goal', icon: Target, color: 'blue', value: goal > 0 ? formatCurrency(displayGoal) : '' },
  ];

  return (
    <div className="w-48 h-full bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-3 shadow-sm">
      <div className="mb-2">
        <h3 className="text-sm text-gray-400 tracking-wider uppercase">Control</h3>
      </div>
      
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <div key={action.id} className="flex flex-col gap-1">
            <button
              onClick={() => onProfileAction(action.id)}
              className="flex items-center gap-3 px-3 py-3 bg-black border border-gray-800 hover:border-blue-600 hover:bg-gray-950 rounded-lg transition-all duration-300 group"
            >
              <div className="p-1.5 bg-gray-800 group-hover:bg-blue-600 rounded transition-all duration-300">
                <Icon size={16} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
                {action.label}
              </span>
            </button>
            <div className="px-3">
              <span className="text-xs text-gray-500">
                {action.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

