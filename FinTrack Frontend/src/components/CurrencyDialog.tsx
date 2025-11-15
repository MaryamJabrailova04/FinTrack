import React from 'react';
import { X } from 'lucide-react';

interface CurrencyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCurrency: (currency: 'USD' | 'AZN') => void;
  selectedCurrency?: 'USD' | 'AZN';
}

export function CurrencyDialog({
  isOpen,
  onClose,
  onSelectCurrency,
  selectedCurrency = 'USD',
}: CurrencyDialogProps) {
  const currencies = [
    { id: 'USD', label: 'USD', symbol: '$' },
    { id: 'AZN', label: 'AZN', symbol: '₼' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Select Currency</h2>
            <p className="text-sm text-gray-400 mt-1">Choose your preferred currency</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Currency Options */}
        <div className="p-6 space-y-3">
          {currencies.map((currency) => (
            <button
              key={currency.id}
              onClick={() => {
                onSelectCurrency(currency.id as 'USD' | 'AZN');
                onClose();
              }}
              className={`w-full p-4 rounded-lg border transition-all duration-300 text-left ${
                selectedCurrency === currency.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-600 hover:bg-gray-950'
              }`}
            >
              <span className="text-base font-medium">{currency.label} ({currency.symbol})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

