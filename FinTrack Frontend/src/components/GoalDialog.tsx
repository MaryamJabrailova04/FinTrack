import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface GoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal?: number; // Goal in USD
  onUpdateGoal?: (goal: number) => void;
  currency?: 'USD' | 'AZN';
  convertToDisplayCurrency?: (amountUSD: number) => number;
  convertFromDisplayCurrency?: (amount: number) => number;
  getCurrencySymbol?: () => string;
}

export function GoalDialog({
  isOpen,
  onClose,
  currentGoal = 0,
  onUpdateGoal,
  currency = 'USD',
  convertToDisplayCurrency = (amount) => amount,
  convertFromDisplayCurrency = (amount) => amount,
  getCurrencySymbol = () => '$',
}: GoalDialogProps) {
  const displayGoal = convertToDisplayCurrency(currentGoal);
  const [goal, setGoal] = useState(displayGoal.toString());

  // Update goal when currentGoal prop changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      const displayGoal = convertToDisplayCurrency(currentGoal);
      setGoal(displayGoal.toString());
    }
  }, [isOpen, currentGoal, convertToDisplayCurrency]);

  const handleSubmit = () => {
    const goalValue = parseFloat(goal);
    if (isNaN(goalValue) || goalValue <= 0) {
      return;
    }

    if (onUpdateGoal) {
      // Convert back to USD for storage
      const goalUSD = convertFromDisplayCurrency(goalValue);
      onUpdateGoal(goalUSD);
    }

    onClose();
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setGoal(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Set Goal</h2>
            <p className="text-sm text-gray-400 mt-1">Set your monthly spending goal</p>
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
          {/* Goal */}
          <div className="space-y-2">
            <Label className="text-gray-300">Monthly Goal</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySymbol()}</span>
              <Input
                type="text"
                value={goal}
                onChange={handleGoalChange}
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
            disabled={!goal || parseFloat(goal) <= 0 || isNaN(parseFloat(goal))}
          >
            Set Goal
          </Button>
        </div>
      </div>
    </div>
  );
}

