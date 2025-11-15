import React from 'react';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface EditSpendingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initial: {
    category: string;
    amount: number;
    date: string;
    description: string;
  };
  existingCategories: string[];
  onAddCategory: (category: string) => void;
  onSave: (spending: { category: string; amount: number; date: string; description: string }) => void;
  onDelete: () => void;
  currency?: 'USD' | 'AZN';
  convertFromDisplayCurrency?: (amount: number) => number;
  getCurrencySymbol?: () => string;
}

export function EditSpendingDialog({
  isOpen,
  onClose,
  initial,
  existingCategories,
  onAddCategory,
  onSave,
  onDelete,
  currency = 'USD',
  convertFromDisplayCurrency = (amount) => amount,
  getCurrencySymbol = () => '$',
}: EditSpendingDialogProps) {
  const [category, setCategory] = useState(initial.category);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(initial.date);
  const [description, setDescription] = useState(initial.description);

  useEffect(() => {
    if (isOpen) {
      setCategory(initial.category);
      setDate(initial.date);
      setDescription(initial.description);
      setAmount(initial.amount.toString());
    }
  }, [isOpen, initial]);

  const handleSubmit = () => {
    if (!category || !amount || !date || !description) return;
    const amountUSD = convertFromDisplayCurrency(parseFloat(amount));
    onSave({ category, amount: amountUSD, date, description });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Edit Spending</h2>
            <p className="text-sm text-gray-400 mt-1">Update or delete this expense</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {existingCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-lg border transition-all duration-300 text-sm capitalize ${
                    category === cat
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {!existingCategories.includes(category) && category && (
              <div className="text-xs text-gray-400 mt-2">
                This category is new.{' '}
                <button
                  className="text-blue-400 hover:text-blue-300 underline"
                  onClick={() => onAddCategory(category)}
                >
                  Add it
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Lunch at restaurant"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySymbol()}</span>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 flex gap-3">
          <Button
            onClick={onDelete}
            variant="outline"
            className="bg-transparent border-red-700 text-red-400 hover:bg-red-900/30 hover:text-white"
          >
            Delete
          </Button>
          <div className="flex-1" />
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white"
            disabled={!category || !amount || !date || !description}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}


