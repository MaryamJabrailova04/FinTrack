import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface Subscription {
  id: number;
  service: string;
  date: string;
  amount: number;
  color: string;
}

interface SubscriptionCalendarProps {
  subscriptions: Subscription[]; // Amounts in USD
  currency?: 'USD' | 'AZN';
  convertToDisplayCurrency?: (amountUSD: number) => number;
  formatCurrency?: (amount: number) => string;
  onEditSubscription?: (sub: Subscription) => void;
  onDeleteSubscription?: (sub: Subscription) => void;
  onImportFromGoogle?: () => void;
}

export function SubscriptionCalendar({ 
  subscriptions,
  currency = 'USD',
  convertToDisplayCurrency = (amount) => amount,
  formatCurrency = (amount) => `$${amount.toFixed(2)}`,
  onEditSubscription,
  onDeleteSubscription,
  onImportFromGoogle
}: SubscriptionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getSubscriptionsForDate = (day: number) => {
    const y = currentDate.getFullYear();
    const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${day.toString().padStart(2, '0')}`;
    return subscriptions.filter(sub => sub.date === dateStr);
  };

  const totalMonthlyUSD = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalMonthly = convertToDisplayCurrency(totalMonthlyUSD);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="h-full w-full p-8 pt-20 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-white tracking-wider uppercase mb-2">Subscriptions</h1>
            <p className="text-gray-400">Manage your recurring payments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-black border border-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Monthly Total</p>
              <p className="text-2xl text-white">{formatCurrency(totalMonthly)}</p>
            </div>
            {onImportFromGoogle && (
              <button
                onClick={onImportFromGoogle}
                className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg border border-green-700 transition-all duration-300 shadow-sm"
              >
                Import from Google
              </button>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-black border border-gray-800 rounded-xl p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-white tracking-wider">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-400" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const subs = getSubscriptionsForDate(day);
              const today = new Date();
              const isToday = today.getFullYear() === currentDate.getFullYear()
                && today.getMonth() === currentDate.getMonth()
                && today.getDate() === day;

              return (
                <div
                  key={day}
                  className={`aspect-square p-2 rounded-lg border transition-all duration-300 ${
                    isToday
                      ? 'border-blue-600 bg-blue-600/10'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm mb-1 ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>
                      {day}
                    </span>
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {subs.map((sub) => (
                        <div
                          key={sub.id}
                          className={`text-xs px-1.5 py-0.5 rounded truncate ${
                            sub.color === 'red'
                              ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                              : 'bg-green-600/20 text-green-400 border border-green-600/30'
                          }`}
                          title={`${sub.service} - ${formatCurrency(convertToDisplayCurrency(sub.amount))}`}
                        >
                          {sub.service}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription List */}
        <div className="bg-black border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg text-white mb-4 tracking-wider">Active Subscriptions</h2>
          
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon size={48} className="text-gray-700" />
              <p className="text-gray-500">No subscriptions yet</p>
              <p className="text-sm text-gray-600 mt-2">Use the control panel to add subscriptions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      sub.color === 'red' ? 'bg-red-600/20' : 'bg-green-600/20'
                    }`}>
                      {sub.service === 'Netflix' ? (
                        <span className="text-red-500">N</span>
                      ) : (
                        <span className="text-green-500">S</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white">{sub.service}</p>
                      <p className="text-sm text-gray-500">Next payment: {sub.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg text-white">
                      {formatCurrency(convertToDisplayCurrency(sub.amount))}/mo
                    </div>
                    {onEditSubscription && (
                      <button
                        onClick={() => onEditSubscription(sub)}
                        className="px-3 py-1.5 text-sm bg-black border border-gray-800 hover:border-blue-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {onDeleteSubscription && (
                      <button
                        onClick={() => onDeleteSubscription(sub)}
                        className="px-3 py-1.5 text-sm bg-black border border-gray-800 hover:border-red-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                      </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
