import React from 'react';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface AddSpendingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (spending: {
    category: string;
    amount: number; // Amount in USD
    date: string;
    description: string;
  }) => void;
  existingCategories: string[];
  onAddCategory: (category: string) => void;
  currency?: 'USD' | 'AZN';
  convertFromDisplayCurrency?: (amount: number) => number;
  getCurrencySymbol?: () => string;
}

export function AddSpendingDialog({
  isOpen,
  onClose,
  onAdd,
  existingCategories,
  onAddCategory,
  currency = 'USD',
  convertFromDisplayCurrency = (amount) => amount,
  getCurrencySymbol = () => '$',
}: AddSpendingDialogProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const handleSubmit = () => {
    if (!category || !amount || !date || !description) {
      return;
    }

    const amountValue = parseFloat(amount);
    // Convert from display currency to USD for storage
    const amountUSD = convertFromDisplayCurrency(amountValue);
    
    onAdd({
      category,
      amount: amountUSD,
      date,
      description,
    });

    // Reset form
    setCategory('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    onClose();
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim().toLowerCase());
      setCategory(newCategoryName.trim().toLowerCase());
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Add Spending</h2>
            <p className="text-sm text-gray-400 mt-1">Record a new expense</p>
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
          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Category</Label>
            {!showNewCategoryInput ? (
              <div className="space-y-2">
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
                <button
                  onClick={() => setShowNewCategoryInput(true)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Add New Category
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory()}
                  />
                  <Button
                    onClick={handleAddNewCategory}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    Add
                  </Button>
                </div>
                <button
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Lunch at restaurant"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Price */}
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

          {/* Date */}
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
            disabled={!category || !amount || !date || !description}
          >
            Add Spending
          </Button>
        </div>
      </div>
    </div>
  );
}
