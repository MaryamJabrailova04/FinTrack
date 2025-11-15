import React from 'react';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface AddSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: {
    service: string;
    amount: number; // Amount in USD
    date: string;
    color: string;
    sendMail?: boolean;
  }) => void;
  existingServices: string[];
  onAddService: (service: string) => void;
  currency?: 'USD' | 'AZN';
  convertFromDisplayCurrency?: (amount: number) => number;
  getCurrencySymbol?: () => string;
}

export function AddSubscriptionDialog({
  isOpen,
  onClose,
  onAdd,
  existingServices,
  onAddService,
  currency = 'USD',
  convertFromDisplayCurrency = (amount) => amount,
  getCurrencySymbol = () => '$',
}: AddSubscriptionDialogProps) {
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [newServiceName, setNewServiceName] = useState('');
  const [showNewServiceInput, setShowNewServiceInput] = useState(false);
  const [sendMail, setSendMail] = useState(false);

  const handleSubmit = () => {
    if (!service || !amount || !date) {
      return;
    }

    const colors = ['red', 'green', 'blue', 'purple', 'yellow'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const amountValue = parseFloat(amount);
    // Convert from display currency to USD for storage
    const amountUSD = convertFromDisplayCurrency(amountValue);
    
    onAdd({
      service,
      amount: amountUSD,
      date,
      color: randomColor,
      sendMail,
    });

    // Reset form
    setService('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowNewServiceInput(false);
    setNewServiceName('');
    setSendMail(false);
    onClose();
  };

  const handleAddNewService = () => {
    if (newServiceName.trim()) {
      onAddService(newServiceName.trim());
      setService(newServiceName.trim());
      setNewServiceName('');
      setShowNewServiceInput(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Add Subscription</h2>
            <p className="text-sm text-gray-400 mt-1">Set up a recurring payment</p>
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
          {/* Service Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Service</Label>
            {!showNewServiceInput ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {existingServices.map((serv) => (
                    <button
                      key={serv}
                      onClick={() => setService(serv)}
                      className={`p-3 rounded-lg border transition-all duration-300 text-sm ${
                        service === serv
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {serv}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowNewServiceInput(true)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Add New Service
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Enter service name..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewService()}
                  />
                  <Button
                    onClick={handleAddNewService}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    Add
                  </Button>
                </div>
                <button
                  onClick={() => {
                    setShowNewServiceInput(false);
                    setNewServiceName('');
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label className="text-gray-300">Monthly Price</Label>
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

          {/* Next Payment Date */}
          <div className="space-y-2">
            <Label className="text-gray-300">Next Payment Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Send Mail */}
          <div className="space-y-2">
            <Label className="text-gray-300">Send Mail</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setSendMail(true)}
                className={`flex-1 p-3 rounded-lg border transition-all duration-300 text-sm font-medium ${
                  sendMail
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setSendMail(false)}
                className={`flex-1 p-3 rounded-lg border transition-all duration-300 text-sm font-medium ${
                  !sendMail
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                No
              </button>
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
            disabled={!service || !amount || !date}
          >
            Add Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}
