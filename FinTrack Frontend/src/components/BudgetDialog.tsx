import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface BudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget?: number; // Budget in USD
  onUpdateBudget?: (budget: number) => void;
  currency?: 'USD' | 'AZN';
  convertToDisplayCurrency?: (amountUSD: number) => number;
  convertFromDisplayCurrency?: (amount: number) => number;
  getCurrencySymbol?: () => string;
}

export function BudgetDialog({
  isOpen,
  onClose,
  currentBudget = 0,
  onUpdateBudget,
  currency = 'USD',
  convertToDisplayCurrency = (amount) => amount,
  convertFromDisplayCurrency = (amount) => amount,
  getCurrencySymbol = () => '$',
}: BudgetDialogProps) {
  const displayBudget = convertToDisplayCurrency(currentBudget);
  const [budget, setBudget] = useState(displayBudget.toString());

  // Update budget when currentBudget prop changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      const displayBudget = convertToDisplayCurrency(currentBudget);
      setBudget(displayBudget.toString());
    }
  }, [isOpen, currentBudget, convertToDisplayCurrency]);

  const handleSubmit = () => {
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      return;
    }

    if (onUpdateBudget) {
      // Convert back to USD for storage
      const budgetUSD = convertFromDisplayCurrency(budgetValue);
      onUpdateBudget(budgetUSD);
    }

    onClose();
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBudget(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Change Budget</h2>
            <p className="text-sm text-gray-400 mt-1">Update your monthly budget</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Budget */}
          <div className="space-y-2">
            <Label className="text-gray-300">Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySymbol()}</span>
              <Input
                type="text"
                value={budget}
                onChange={handleBudgetChange}
                placeholder="0.00"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-8"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            disabled={!budget || parseFloat(budget) <= 0 || isNaN(parseFloat(budget))}
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}

