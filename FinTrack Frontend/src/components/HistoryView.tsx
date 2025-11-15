import React from 'react';
import { useEffect, useState } from 'react';
import { DollarSign, Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import { getMonthHistory } from '../services/historyService';

interface Spending {
  id: number;
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface Subscription {
  id: number;
  service: string;
  date: string;
  amount: number;
  color: string;
}

interface HistoryViewProps {
  spendings?: Spending[]; // fallback
  subscriptions?: Subscription[]; // fallback
  currency?: 'USD' | 'AZN';
  convertToDisplayCurrency?: (amountUSD: number) => number;
  formatCurrency?: (amount: number) => string;
}

export function HistoryView({ 
  spendings = [], 
  subscriptions = [],
  currency = 'USD',
  convertToDisplayCurrency = (amount) => amount,
  formatCurrency = (amount) => `$${amount.toFixed(2)}`
}: HistoryViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date(2025, new Date().getMonth(), 1));
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendSpendings, setBackendSpendings] = useState<Spending[]>([]);
  const [backendSubscriptions, setBackendSubscriptions] = useState<Subscription[]>([]);
  const [totals, setTotals] = useState<{ expenses: number; subscriptions: number; combined: number }>({
    expenses: 0, subscriptions: 0, combined: 0,
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [selectedMonth.getFullYear()];

  useEffect(() => {
    void loadMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  async function loadMonth() {
    setError(null);
    setLoading(true);
    try {
      const y = selectedMonth.getFullYear();
      const m = selectedMonth.getMonth() + 1;
      const data = await getMonthHistory({ year: y, month: m, details: true });
      setTotals(data.totals);
      const mappedExpenses: Spending[] = (data.expenses || []).map((e: any) => ({
        id: e.id,
        category: e.category || 'uncategorized',
        amount: Number(e.price || e.total || 0),
        date: (e.time || '').slice(0, 10),
        description: e.name || '',
      }));
      const mappedSubs: Subscription[] = (data.subscriptions || []).map((s: any) => ({
        id: s.id,
        service: s.name,
        date: (s.start_date || '').slice(0, 10),
        amount: Number(s.price || 0),
        color: (s.name || '').toLowerCase().includes('netflix') ? 'red' : 'green',
      }));
      setBackendSpendings(mappedExpenses);
      setBackendSubscriptions(mappedSubs);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load history');
      // fallback to props if any
      setBackendSpendings(spendings);
      setBackendSubscriptions(subscriptions);
      const totalSpendingsUSD = spendings.reduce((sum, s) => sum + s.amount, 0);
      const totalSubsUSD = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      setTotals({ expenses: totalSpendingsUSD, subscriptions: totalSubsUSD, combined: totalSpendingsUSD + totalSubsUSD });
    } finally {
      setLoading(false);
    }
  }

  // Filter spendings and subscriptions for selected month
  const filteredSpendings = backendSpendings.filter(spending => {
    const spendingDate = new Date(spending.date);
    return spendingDate.getMonth() === selectedMonth.getMonth() &&
           spendingDate.getFullYear() === selectedMonth.getFullYear();
  });

  const filteredSubscriptions = backendSubscriptions.filter(subscription => {
    const subDate = new Date(subscription.date);
    return subDate.getMonth() === selectedMonth.getMonth() &&
           subDate.getFullYear() === selectedMonth.getFullYear();
  });

  // Calculate statistics (in USD)
  const totalSpendingsUSD = totals.expenses || filteredSpendings.reduce((sum, spending) => sum + spending.amount, 0);
  const totalSubscriptionsUSD = totals.subscriptions || filteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalExpensesUSD = totals.combined || (totalSpendingsUSD + totalSubscriptionsUSD);
  
  // Convert to display currency
  const totalSpendings = convertToDisplayCurrency(totalSpendingsUSD);
  const totalSubscriptions = convertToDisplayCurrency(totalSubscriptionsUSD);
  const totalExpenses = convertToDisplayCurrency(totalExpensesUSD);

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedMonth(new Date(year, month, 1));
    setIsMonthPickerOpen(false);
  };

  return (
    <div className="h-full w-full p-8 pt-20 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-white tracking-wider uppercase mb-2">History</h1>
            <p className="text-gray-400">View your monthly statistics and transactions</p>
          </div>
          
          {/* Month Selector */}
          <div className="relative">
            <button
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-800 hover:border-blue-600 text-white rounded-lg transition-all duration-300"
            >
              <Calendar size={18} className="text-gray-400" />
              <span className="text-sm">
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Month Picker Dropdown */}
            {isMonthPickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMonthPickerOpen(false)}
                />
                <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 p-4 min-w-[200px]">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {years.map((year) => (
                      <div key={year} className="space-y-1">
                        <div className="text-xs text-gray-500 bg-gray-900 px-2 py-1 font-medium sticky top-0">
                          {year}
                        </div>
                        {monthNames.map((month, monthIndex) => (
                          <button
                            key={`${year}-${monthIndex}`}
                            onClick={() => handleMonthSelect(year, monthIndex)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                              selectedMonth.getMonth() === monthIndex &&
                              selectedMonth.getFullYear() === year
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800'
                            }`}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gray-900 rounded-lg">
                <DollarSign size={20} className="text-blue-600" />
              </div>
              <span className="text-sm text-gray-400">Total Spendings</span>
            </div>
                <p className="text-2xl text-white">{formatCurrency(totalSpendings)}</p>
          </div>

          <div className="bg-black border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gray-900 rounded-lg">
                <RefreshCw size={20} className="text-green-500" />
              </div>
              <span className="text-sm text-gray-400">Subscriptions</span>
            </div>
                <p className="text-2xl text-white">{formatCurrency(totalSubscriptions)}</p>
          </div>

          <div className="bg-black border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gray-900 rounded-lg">
                <DollarSign size={20} className="text-red-500" />
              </div>
              <span className="text-sm text-gray-400">Total Expenses</span>
            </div>
                <p className="text-2xl text-white">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        {loading && (
          <div className="text-sm text-gray-400">Loading history…</div>
        )}
        {error && (
          <div className="text-sm text-red-400">{error}</div>
        )}

        {/* Spendings List */}
        <div className="bg-black border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg text-white mb-4 tracking-wider">Spendings</h2>
          
          {filteredSpendings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No spendings recorded for this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSpendings.map((spending) => (
                <div
                  key={spending.id}
                  className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-black rounded-lg">
                      <DollarSign size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-white">{spending.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-800 uppercase px-2 py-0.5 rounded">
                          {spending.category}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar size={12} />
                          {spending.date}
                        </span>
                      </div>
                    </div>
                  </div>
                      <div className="text-lg text-white">
                        {formatCurrency(convertToDisplayCurrency(spending.amount))}
                      </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscriptions List */}
        <div className="bg-black border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg text-white mb-4 tracking-wider">Subscriptions</h2>
          
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No subscriptions for this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      subscription.color === 'red' ? 'bg-red-600/20' : 'bg-green-600/20'
                    }`}>
                      {subscription.service === 'Netflix' ? (
                        <span className="text-red-500 text-sm font-bold">N</span>
                      ) : (
                        <span className="text-green-500 text-sm font-bold">S</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white">{subscription.service}</p>
                      <p className="text-sm text-gray-500">Payment date: {subscription.date}</p>
                    </div>
                  </div>
                      <div className="text-lg text-white">
                        {formatCurrency(convertToDisplayCurrency(subscription.amount))}
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

