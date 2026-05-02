import React from 'react';
import { useState, useEffect } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { AIChat } from './components/AIChat';
import { SpendingsPanel } from './components/SpendingsPanel';
import { BudgetTracker } from './components/BudgetTracker';
import { EditSpendingDialog } from './components/EditSpendingDialog';
import { AddSpendingDialog } from './components/AddSpendingDialog';
import { SubscribesPanel } from './components/SubscribesPanel';
import { SubscriptionCalendar } from './components/SubscriptionCalendar';
import { EditSubscriptionDialog } from './components/EditSubscriptionDialog';
import { AddSubscriptionDialog } from './components/AddSubscriptionDialog';
import { ProfilePanel } from './components/ProfilePanel';
import { SettingsPanel } from './components/SettingsPanel';
import { LanguageDialog } from './components/LanguageDialog';
import { ThemeDialog } from './components/ThemeDialog';
import { CurrencyDialog } from './components/CurrencyDialog';
import { RewardsList } from './components/RewardsList';
import { HistoryView } from './components/HistoryView';
import { SignUpDialog } from './components/SignUpDialog';
import { SignInDialog } from './components/SignInDialog';
import { UsernameDialog } from './components/UsernameDialog';
import { BudgetDialog } from './components/BudgetDialog';
import { GoalDialog } from './components/GoalDialog';
import { CreditCard, RefreshCw, Sparkles } from 'lucide-react';
import { login, register, me, logout, googleLogin } from './services/authService';
import { listExpenses, createExpense, getCategories, createCategory, updateExpense, deleteExpense } from './services/expensesService';
import { createSubscription, getSubscriptionCalendar, updateSubscription, deleteSubscription } from './services/subscriptionsService';
import { importSubscriptionsFromGoogle } from './services/subscriptionsService';
import { getProfileMe, updateProfileMe } from './services/profileService';
import { getSettingsMe, updateSettingsMe } from './services/settingsService';
import { clearTokens, getAccessToken } from './services/token';
import { getGmailAccessToken } from './services/google';

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
  sendMail?: boolean;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  earned: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isProfilePanelVisible, setIsProfilePanelVisible] = useState(false);
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isRewardsPanelVisible, setIsRewardsPanelVisible] = useState(false);
  const [isHistoryPanelVisible, setIsHistoryPanelVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddSubscriptionDialogOpen, setIsAddSubscriptionDialogOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);
  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false);
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [username, setUsername] = useState('User');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [budget, setBudget] = useState(5000); // Store budget in USD
  const [goal, setGoal] = useState(0); // Store goal in USD
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'AZN'>('USD');
  const [activeView, setActiveView] = useState<'home' | 'spendings' | 'subscribes'>('home');
  const [categories, setCategories] = useState<string[]>(['food', 'taxi', 'coffee', 'shopping', 'entertainment']);
  const [categoryNameToId, setCategoryNameToId] = useState<Record<string, number>>({});
  const [services, setServices] = useState<string[]>(['Netflix', 'Spotify', 'YouTube Premium', 'Apple Music']);
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  const [editingSpending, setEditingSpending] = useState<Spending | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsError, setRewardsError] = useState<string | null>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);

  const handleAddSpending = (category: string) => {
    if (category === 'add') {
      // Open the dialog
      setIsAddDialogOpen(true);
    } else {
      // Quick-add to backend with generated description and amount
      const amounts: Record<string, number> = {
        food: 25 + Math.random() * 50,
        taxi: 10 + Math.random() * 30,
        coffee: 3 + Math.random() * 7,
      };
      const amount = amounts[category] || 20;
      const description = `${category.charAt(0).toUpperCase() + category.slice(1)} Purchase`;
      void addExpenseToBackend({ category, amount, date: new Date().toISOString().split('T')[0], description });
    }
  };

  const handleAddSpendingFromDialog = (spending: Omit<Spending, 'id'>) => {
    void addExpenseToBackend(spending);
  };

  const handleAddCategory = (category: string) => {
    void ensureCategory(category);
  };

  const handleAddSubscribe = (service: string) => {
    if (service === 'add') {
      // Open the dialog
      setIsAddSubscriptionDialogOpen(true);
    } else {
      // Quick-add to backend with reasonable defaults
      const amounts: Record<string, number> = { netflix: 15.99, spotify: 9.99 };
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      void addSubscriptionToBackend({
        service: service.charAt(0).toUpperCase() + service.slice(1),
        amount: amounts[service.toLowerCase()] || 10.99,
        date: dateStr,
        color: 'green',
        sendMail: false,
      });
    }
  };

  const handleAddSubscriptionFromDialog = (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      id: Date.now(),
      ...subscription,
    };
    setSubscriptions(prev => [newSubscription, ...prev]);
  };

  const handleImportSubscriptionsFromGoogle = async () => {
    try {
      setSubsLoading(true);
      const token = await getGmailAccessToken();
      const res = await importSubscriptionsFromGoogle(token);
      await reloadSubscriptions();
      alert(`Imported: created ${res.created}, updated ${res.updated}`);
    } catch (e: any) {
      console.error(e);
      setSubsError(e?.message || 'Google import failed');
    } finally {
      setSubsLoading(false);
    }
  };

  const handleAddService = (service: string) => {
    if (!services.includes(service)) {
      setServices(prev => [...prev, service]);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setAuthLoading(true);
      const { getGoogleIdToken } = await import('./services/google');
      const idToken = await getGoogleIdToken();
      const user = await googleLogin(idToken);
      setUsername(user.first_name || user.username || 'User');
      setIsAuthenticated(true);
      await initializeUserProfileAndSettings();
      await reloadExpenses();
    } catch (e: any) {
      setAuthError(e?.response?.data?.detail || e?.message || 'Google sign-in failed');
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileAction = (action: string) => {
    // Handle profile actions (username, budget, goal)
    if (action === 'username') {
      setIsUsernameDialogOpen(true);
    } else if (action === 'budget') {
      setIsBudgetDialogOpen(true);
    } else if (action === 'goal') {
      setIsGoalDialogOpen(true);
    }
  };

  const handleUpdateUsername = (newUsername: string) => {
    setUsername(newUsername);
    void updateProfileMe({ first_name: newUsername }).catch(console.error);
  };

  const handleUpdateBudget = (newBudget: number) => {
    setBudget(newBudget);
    void (async () => {
      try {
        await updateProfileMe({ monthly_goal: newBudget.toFixed(2) });
        await reloadExpenses();
      } catch (e) {
        console.error(e);
      }
    })();
  };

  const handleUpdateGoal = (newGoal: number) => {
    setGoal(newGoal);
    void (async () => {
      try {
        await updateSettingsMe({ savings_goal: newGoal.toFixed(2) });
        try {
          localStorage.setItem('ft_goal', newGoal.toFixed(2));
        } catch (_) {}
      } catch (e) {
        console.error(e);
      }
    })();
  };

  // Currency conversion functions
  const USD_TO_AZN_RATE = 1.7;
  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  
  const convertToDisplayCurrency = (amountUSD: number): number => {
    if (selectedCurrency === 'AZN') {
      return round2(amountUSD * USD_TO_AZN_RATE);
    }
    return round2(amountUSD);
  };

  const convertFromDisplayCurrency = (amount: number): number => {
    if (selectedCurrency === 'AZN') {
      return round2(amount / USD_TO_AZN_RATE);
    }
    return round2(amount);
  };

  const getCurrencySymbol = (): string => {
    return selectedCurrency === 'AZN' ? '₼' : '$';
  };

  const formatCurrency = (amount: number): string => {
    return `${getCurrencySymbol()}${amount.toFixed(2)}`;
  };

  const handleSettingsAction = (action: string) => {
    // Handle settings actions (language, currency, theme)
    if (action === 'language') {
      setIsLanguageDialogOpen(true);
    } else if (action === 'theme') {
      setIsThemeDialogOpen(true);
    } else if (action === 'currency') {
      setIsCurrencyDialogOpen(true);
    } else {
      console.log('Settings action:', action);
    }
  };

  const handleSelectCurrency = (currency: 'USD' | 'AZN') => {
    setSelectedCurrency(currency);
    void updateSettingsMe({ currency }).catch(console.error);
  };

  const handleSelectLanguage = (language: string) => {
    setSelectedLanguage(language);
    // map UI id to backend codes
    const langCode = language === 'azerbaijani' ? 'az' : 'en';
    void updateSettingsMe({ language: langCode }).catch(console.error);
  };

  const handleSelectTheme = (theme: string) => {
    setSelectedTheme(theme);
    void updateSettingsMe({ theme }).catch(console.error);
  };

  // Apply dark theme to document root
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Preload cached goal before API returns (optional UX improvement)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('ft_goal');
      if (cached !== null && !Number.isNaN(Number(cached))) {
        setGoal(Number(cached));
      }
    } catch (_) {
      // ignore storage errors
    }
  }, []);
  // Detect existing auth tokens on load and hydrate user/settings
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsAuthenticated(true);
      void (async () => {
        try {
          const u = await me();
          setUsername(u.username || 'User');
        } catch (e) {
          clearTokens();
          setIsAuthenticated(false);
          return;
        }
        await initializeUserProfileAndSettings();
      })();
    }
  }, []);

  // If not authenticated, preload demo/mock data (one-time)
  useEffect(() => {
    if (!isAuthenticated && !demoLoaded) {
      loadDemoData();
      setDemoLoaded(true);
    }
  }, [isAuthenticated, demoLoaded]);

  function loadDemoData() {
    try {
      const today = new Date();
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const daysAgo = (n: number) => {
        const d = new Date();
        d.setDate(today.getDate() - n);
        return iso(d);
      };
      setBudget(1200);
      setGoal(800);
      setCategories((prev) => Array.from(new Set([...prev, 'groceries', 'entertainment', 'transport', 'coffee'])));
      setSpendings([
        { id: 101, category: 'groceries', amount: 64.25, date: daysAgo(1), description: 'Market purchase' },
        { id: 102, category: 'coffee', amount: 4.75, date: daysAgo(1), description: 'Latte' },
        { id: 103, category: 'transport', amount: 12.40, date: daysAgo(2), description: 'Taxi ride' },
        { id: 104, category: 'entertainment', amount: 19.99, date: daysAgo(3), description: 'Movie night' },
        { id: 105, category: 'groceries', amount: 28.30, date: daysAgo(4), description: 'Bakery & fruits' },
      ]);
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      setServices((prev) => Array.from(new Set([...prev, 'Netflix', 'Spotify', 'YouTube Premium'])));
      setSubscriptions([
        { id: 201, service: 'Netflix', date: `${y}-${m}-17`, amount: 15.99, color: 'red' },
        { id: 202, service: 'Spotify', date: `${y}-${m}-24`, amount: 9.99, color: 'green' },
        { id: 203, service: 'YouTube Premium', date: `${y}-${m}-12`, amount: 11.99, color: 'green' },
      ]);
      setRewards([
        { id: 1, title: '7 Day Strike', description: 'Track your expenses for 7 consecutive days', earned: true },
        { id: 2, title: 'Master of Budgeting', description: 'Stay within budget for an entire month', earned: false },
        { id: 3, title: 'Savings Champion', description: 'Save $500 in a month', earned: false },
      ]);
    } catch (_) {
      // ignore
    }
  }
  // Reload expenses when switching to spendings view
  useEffect(() => {
    if (activeView === 'spendings' && isAuthenticated) {
      void reloadExpenses();
    } else if (activeView === 'spendings') {
      setExpensesError(null);
      setExpensesLoading(false);
    }
  }, [activeView, isAuthenticated]);

  async function initializeUserProfileAndSettings() {
    try {
      const profile = await getProfileMe();
      const mg = Number(profile?.monthly_goal ?? 0);
      if (!Number.isNaN(mg) && Number.isFinite(mg)) setBudget(mg);
      // prefer first_name as display if set
      if (profile?.first_name) {
        setUsername(profile.first_name);
      }
    } catch (e) {
      // ignore
    }
    try {
      const settings = await getSettingsMe();
      if (settings?.currency === 'AZN' || settings?.currency === 'USD') {
        setSelectedCurrency(settings.currency as 'USD' | 'AZN');
      }
      if (settings?.theme) {
        setSelectedTheme(settings.theme);
      }
      if (settings?.language) {
        // map backend code to UI id
        setSelectedLanguage(settings.language === 'az' ? 'azerbaijani' : 'english');
      }
      const g = Number(settings?.savings_goal ?? 0);
      if (!Number.isNaN(g) && Number.isFinite(g)) {
        setGoal(g);
        try {
          localStorage.setItem('ft_goal', g.toFixed(2));
        } catch (_) {}
      }
    } catch (e) {
      // ignore
    }
  }

  // Reload subscriptions when switching to subscribes view
  useEffect(() => {
    if (activeView === 'subscribes' && isAuthenticated) {
      void reloadSubscriptions();
    } else if (activeView === 'subscribes') {
      setSubsError(null);
      setSubsLoading(false);
    }
  }, [activeView, isAuthenticated]);

  // Load rewards when rewards panel is shown
  useEffect(() => {
    if (activeTab === 'rewards' && isRewardsPanelVisible && isAuthenticated) {
      void reloadRewards();
    } else if (activeTab === 'rewards' && isRewardsPanelVisible) {
      setRewardsError(null);
      setRewardsLoading(false);
    }
  }, [activeTab, isRewardsPanelVisible, isAuthenticated]);

  async function reloadExpenses() {
    if (!getAccessToken()) {
      setExpensesError(null);
      setExpensesLoading(false);
      return;
    }
    setExpensesError(null);
    setExpensesLoading(true);
    try {
      await loadCategories();
      const today = new Date();
      const res = await listExpenses({ year: today.getFullYear(), month: today.getMonth() + 1 });
      const mgVal = Number((res as any).summary?.monthly_goal ?? 0);
      if (!Number.isNaN(mgVal) && Number.isFinite(mgVal)) {
        setBudget(mgVal);
      }
      const mapped: Spending[] = (res.results || []).map((e: any) => ({
        id: e.id,
        category: e.category?.name || 'uncategorized',
        amount: Number(e.price) || 0,
        date: (e.time || '').slice(0, 10),
        description: e.name || '',
      }));
      setSpendings(mapped);
    } catch (e: any) {
      setExpensesError(e?.response?.data?.detail || 'Failed to load expenses');
      console.error(e);
    } finally {
      setExpensesLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const list = await getCategories();
      const names = list.map(c => c.name.toLowerCase());
      const map: Record<string, number> = {};
      list.forEach(c => {
        map[c.name.toLowerCase()] = c.id;
      });
      setCategories(names);
      setCategoryNameToId(map);
    } catch (e) {
      // ignore if unauthorized
    }
  }

  async function ensureCategory(name: string): Promise<number | null> {
    const key = name.toLowerCase();
    if (categoryNameToId[key]) return categoryNameToId[key];
    try {
      const created = await createCategory(key);
      const newMap = { ...categoryNameToId, [key]: created.id };
      setCategoryNameToId(newMap);
      if (!categories.includes(key)) setCategories(prev => [...prev, key]);
      return created.id;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function addExpenseToBackend(sp: Omit<Spending, 'id'>) {
    setExpensesError(null);
    setExpensesLoading(true);
    try {
      const catId = await ensureCategory(sp.category);
      const iso = `${sp.date}T12:00:00Z`;
      await createExpense({
        name: sp.description,
        price: sp.amount,
        category_id: catId,
        time: iso,
        note: '',
      });
      await reloadExpenses();
    } catch (e: any) {
      setExpensesError(e?.response?.data || 'Failed to create expense');
      console.error(e);
    } finally {
      setExpensesLoading(false);
    }
  }

  async function updateExpenseInBackend(id: number, sp: Omit<Spending, 'id'>) {
    setExpensesError(null);
    setExpensesLoading(true);
    try {
      const catId = await ensureCategory(sp.category);
      const iso = `${sp.date}T12:00:00Z`;
      await updateExpense(id, {
        name: sp.description,
        price: sp.amount,
        category_id: catId,
        time: iso,
        note: '',
      });
      setEditingSpending(null);
      await reloadExpenses();
    } catch (e: any) {
      setExpensesError(e?.response?.data || 'Failed to update expense');
      console.error(e);
    } finally {
      setExpensesLoading(false);
    }
  }

  async function deleteExpenseFromBackend(id: number) {
    setExpensesError(null);
    setExpensesLoading(true);
    try {
      await deleteExpense(id);
      await reloadExpenses();
    } catch (e: any) {
      setExpensesError(e?.response?.data || 'Failed to delete expense');
      console.error(e);
    } finally {
      setExpensesLoading(false);
    }
  }

  async function reloadSubscriptions() {
    if (!getAccessToken()) {
      setSubsError(null);
      setSubsLoading(false);
      return;
    }
    setSubsError(null);
    setSubsLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const cal = await getSubscriptionCalendar({ year, month });
      // Flatten calendar days into our UI-friendly list with dates
      const flat: Subscription[] = [];
      cal.days.forEach((d) => {
        const y = cal.year;
        const m = String(cal.month).padStart(2, '0');
        const ds = `${y}-${m}-${String(d.day).padStart(2, '0')}`;
        d.subscriptions.forEach((s) => {
          flat.push({
            id: s.id,
            service: s.name,
            date: ds,
            amount: Number(s.price) || 0,
            color: (s.name || '').toLowerCase().includes('netflix') ? 'red' : 'green',
          });
        });
      });
      setSubscriptions(flat);
    } catch (e: any) {
      setSubsError(e?.response?.data?.detail || 'Failed to load subscriptions');
      console.error(e);
    } finally {
      setSubsLoading(false);
    }
  }

  async function addSubscriptionToBackend(sub: Omit<Subscription, 'id'>) {
    setSubsError(null);
    setSubsLoading(true);
    try {
      const monthly_day = parseInt(sub.date.slice(8, 10), 10);
      await createSubscription({
        name: sub.service,
        price: sub.amount,
        start_date: sub.date,
        monthly_day,
        notify_email: !!sub.sendMail,
        is_active: true,
      });
      await reloadSubscriptions();
    } catch (e: any) {
      setSubsError(e?.response?.data || 'Failed to create subscription');
      console.error(e);
    } finally {
      setSubsLoading(false);
    }
  }

  async function updateSubscriptionInBackend(id: number, sub: Omit<Subscription, 'id'>) {
    setSubsError(null);
    setSubsLoading(true);
    try {
      const monthly_day = parseInt(sub.date.slice(8, 10), 10);
      await updateSubscription(id, {
        name: sub.service,
        price: sub.amount,
        start_date: sub.date,
        monthly_day,
        notify_email: !!sub.sendMail,
        is_active: true,
      });
      setEditingSubscription(null);
      await reloadSubscriptions();
    } catch (e: any) {
      setSubsError(e?.response?.data || 'Failed to update subscription');
      console.error(e);
    } finally {
      setSubsLoading(false);
    }
  }

  async function deleteSubscriptionFromBackend(id: number) {
    setSubsError(null);
    setSubsLoading(true);
    try {
      await deleteSubscription(id);
      await reloadSubscriptions();
    } catch (e: any) {
      setSubsError(e?.response?.data || 'Failed to delete subscription');
      console.error(e);
    } finally {
      setSubsLoading(false);
    }
  }

  async function reloadRewards() {
    if (!getAccessToken()) {
      setRewardsError(null);
      setRewardsLoading(false);
      return;
    }
    setRewardsError(null);
    setRewardsLoading(true);
    try {
      const mod = await import('./services/rewardsService');
      const data = await mod.getRewards();
      // Merge rewards and earned flags
      const earnedIds = new Set((data.earned || []).map((e: any) => e.reward?.id || e.reward_id || e.id));
      const mapped: Reward[] = (data.rewards || []).map((r: any) => ({
        id: r.id,
        title: r.name || r.title || `Reward ${r.id}`,
        description: r.description || '',
        earned: earnedIds.has(r.id),
      }));
      setRewards(mapped);
    } catch (e: any) {
      setRewardsError(e?.response?.data?.detail || 'Failed to load rewards');
      console.error(e);
    } finally {
      setRewardsLoading(false);
    }
  }

  const handleTabChange = (tab: string) => {
    // Store previous state before closing panels
    const wasProfileVisible = activeTab === 'profile' && isProfilePanelVisible;
    const wasSettingsVisible = activeTab === 'settings' && isSettingsPanelVisible;
    const wasRewardsVisible = activeTab === 'rewards' && isRewardsPanelVisible;
    const wasHistoryVisible = activeTab === 'history' && isHistoryPanelVisible;

    // Close all panels first
    setIsProfilePanelVisible(false);
    setIsSettingsPanelVisible(false);
    setIsRewardsPanelVisible(false);
    setIsHistoryPanelVisible(false);
    
    // Close spendings/subscribes view when opening control panels
    setActiveView('home');

    if (tab === 'profile') {
      // Toggle profile panel visibility
      if (wasProfileVisible) {
        // If profile was already active and visible, just close it (already closed above)
        setActiveTab('profile');
      } else {
        // Otherwise, activate profile tab and show panel
        setActiveTab('profile');
        setIsProfilePanelVisible(true);
      }
    } else if (tab === 'settings') {
      // Toggle settings panel visibility
      if (wasSettingsVisible) {
        // If settings was already active and visible, just close it (already closed above)
        setActiveTab('settings');
      } else {
        // Otherwise, activate settings tab and show panel
        setActiveTab('settings');
        setIsSettingsPanelVisible(true);
      }
    } else if (tab === 'rewards') {
      // Toggle rewards panel visibility
      if (wasRewardsVisible) {
        // If rewards was already active and visible, just close it (already closed above)
        setActiveTab('rewards');
      } else {
        // Otherwise, activate rewards tab and show panel
        setActiveTab('rewards');
        setIsRewardsPanelVisible(true);
      }
    } else if (tab === 'history') {
      // Toggle history panel visibility
      if (wasHistoryVisible) {
        // If history was already active and visible, just close it (already closed above)
        setActiveTab('history');
      } else {
        // Otherwise, activate history tab and show panel
        setActiveTab('history');
        setIsHistoryPanelVisible(true);
      }
    } else {
      setActiveTab(tab);
      // All panels already closed above
    }
  };

  const handleViewChange = (view: 'home' | 'spendings' | 'subscribes') => {
    // Close all control panels when switching to spendings/subscribes
    setIsProfilePanelVisible(false);
    setIsSettingsPanelVisible(false);
    setIsRewardsPanelVisible(false);
    setIsHistoryPanelVisible(false);
    setActiveView(view);
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Left Panel */}
        <LeftPanel 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onProfileDoubleClick={() => setIsProfilePanelVisible(false)}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
          {/* Evil atmosphere overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
          
          {/* Center Content */}
          <div className="relative z-10 h-full flex-1 flex items-center justify-center">
            {activeView === 'home' && (
              <div className="p-12 w-full h-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
                  {/* Spendings Button */}
                      <button 
                        onClick={() => handleViewChange('spendings')}
                        className="group aspect-square bg-black border-2 border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-6 transition-all duration-500 shadow-sm hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-600/30 hover:scale-105 relative overflow-hidden"
                      >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-transparent transition-all duration-500" />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                      <div className="p-6 bg-gray-900 group-hover:bg-blue-600 group-hover:shadow-blue-600/50 rounded-full transition-all duration-500 group-hover:shadow-lg">
                        <CreditCard size={48} className="text-gray-400 group-hover:text-white transition-colors duration-500" />
                      </div>
                      <h2 className="text-3xl text-white tracking-wider uppercase">Spendings</h2>
                    </div>
                  </button>

                  {/* Subscriptions Button */}
                      <button 
                        onClick={() => handleViewChange('subscribes')}
                        className="group aspect-square bg-black border-2 border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-6 transition-all duration-500 shadow-sm hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-600/30 hover:scale-105 relative overflow-hidden"
                      >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-transparent transition-all duration-500" />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                      <div className="p-6 bg-gray-900 group-hover:bg-blue-600 group-hover:shadow-blue-600/50 rounded-full transition-all duration-500 group-hover:shadow-lg">
                        <RefreshCw size={48} className="text-gray-400 group-hover:text-white transition-colors duration-500" />
                      </div>
                      <h2 className="text-3xl text-white tracking-wider uppercase">Subscriptions</h2>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeView === 'spendings' && (
              <BudgetTracker 
                spendings={spendings} 
                budget={budget}
                goalUSD={goal}
                currency={selectedCurrency}
                convertToDisplayCurrency={convertToDisplayCurrency}
                formatCurrency={formatCurrency}
                onEditSpending={(sp) => setEditingSpending(sp)}
                onDeleteSpending={(sp) => {
                  if (confirm('Delete this expense?')) {
                    void deleteExpenseFromBackend(sp.id);
                  }
                }}
              />
            )}
            {activeView === 'spendings' && expensesLoading && (
              <div className="absolute top-4 right-4 text-sm text-gray-400">Loading expenses…</div>
            )}
            {activeView === 'spendings' && expensesError && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-red-400">
                {typeof expensesError === 'string' ? expensesError : 'An error occurred'}
              </div>
            )}

            {activeView === 'subscribes' && (
              <SubscriptionCalendar 
                subscriptions={subscriptions}
                currency={selectedCurrency}
                convertToDisplayCurrency={convertToDisplayCurrency}
                formatCurrency={formatCurrency}
                onEditSubscription={(sub) => setEditingSubscription(sub)}
                onDeleteSubscription={(sub) => {
                  if (confirm('Delete this subscription?')) {
                    void deleteSubscriptionFromBackend(sub.id);
                  }
                }}
                onImportFromGoogle={isAuthenticated ? handleImportSubscriptionsFromGoogle : undefined}
              />
            )}
            {activeView === 'subscribes' && subsLoading && (
              <div className="absolute top-4 right-4 text-sm text-gray-400">Loading subscriptions…</div>
            )}
            {activeView === 'subscribes' && subsError && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-red-400">
                {typeof subsError === 'string' ? subsError : 'An error occurred'}
              </div>
            )}


            {/* Rewards View - Show when rewards tab is active and panel is visible */}
            {activeTab === 'rewards' && isRewardsPanelVisible && (
              <RewardsList rewards={rewards} />
            )}

            {/* History View - Show when history tab is active and panel is visible */}
            {activeTab === 'history' && isHistoryPanelVisible && (
              <HistoryView 
                spendings={spendings} 
                subscriptions={subscriptions}
                currency={selectedCurrency}
                convertToDisplayCurrency={convertToDisplayCurrency}
                formatCurrency={formatCurrency}
              />
            )}
          </div>

          {/* Right Control Panel - Only show when in spendings view */}
          {activeView === 'spendings' && (
            <div className="relative z-20">
              <SpendingsPanel onAddSpending={handleAddSpending} />
            </div>
          )}

          {/* Right Control Panel - Only show when in subscribes view */}
          {activeView === 'subscribes' && (
            <div className="relative z-20">
              <SubscribesPanel onAddSubscribe={handleAddSubscribe} />
            </div>
          )}

              {/* Right Control Panel - Only show when profile tab is active and panel is visible */}
              {activeTab === 'profile' && isProfilePanelVisible && (
                <div className="relative z-20">
                  <ProfilePanel 
                    onProfileAction={handleProfileAction}
                    username={username}
                    budget={budget}
                    goal={goal}
                    currency={selectedCurrency}
                    convertToDisplayCurrency={convertToDisplayCurrency}
                    formatCurrency={formatCurrency}
                  />
                </div>
              )}

          {/* Right Control Panel - Only show when settings tab is active and panel is visible */}
          {activeTab === 'settings' && isSettingsPanelVisible && (
            <div className="relative z-20">
              <SettingsPanel onSettingsAction={handleSettingsAction} />
            </div>
          )}

          {/* AI Button - Bottom Right Corner */}
          <button 
            onClick={() => setIsChatOpen(true)} 
            className="absolute bottom-8 right-8 group z-20"
                style={{ marginRight: (activeView === 'spendings' || activeView === 'subscribes' || (activeTab === 'profile' && isProfilePanelVisible) || (activeTab === 'settings' && isSettingsPanelVisible)) ? '12rem' : '0' }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              
              {/* Button */}
              <div className="relative bg-blue-600 hover:bg-blue-500 shadow-blue-600/50 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl transition-all duration-300 group-hover:scale-110">
                <Sparkles size={18} />
                <span className="tracking-wider">AI</span>
              </div>
            </div>
          </button>

          {/* Back Button - Show when not on home */}
          {activeView !== 'home' && (
            <button
              onClick={() => handleViewChange('home')}
              className="absolute top-8 left-8 z-20 px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 hover:border-blue-600 hover:text-white rounded-lg transition-all duration-300 shadow-sm"
            >
              ← Back
            </button>
          )}

          {/* Sign In and Sign Up Buttons - Top Right Corner */}
          {!isAuthenticated ? (
            <div 
              className="absolute top-8 z-20 flex gap-3 transition-all duration-300"
              style={{ 
                right: (activeView === 'spendings' || activeView === 'subscribes' || (activeTab === 'profile' && isProfilePanelVisible) || (activeTab === 'settings' && isSettingsPanelVisible)) ? '14rem' : '2rem' 
              }}
            >
              <button
                onClick={() => setIsSignInDialogOpen(true)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 hover:border-blue-600 hover:text-white rounded-lg transition-all duration-300 shadow-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUpDialogOpen(true)}
                className="px-4 py-2 bg-blue-600 border border-blue-600 text-white hover:bg-blue-500 hover:border-blue-500 rounded-lg transition-all duration-300 shadow-sm shadow-blue-600/30"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div 
              className="absolute top-8 z-20 flex items-center gap-3 transition-all duration-300"
              style={{ 
                right: (activeView === 'spendings' || activeView === 'subscribes' || (activeTab === 'profile' && isProfilePanelVisible) || (activeTab === 'settings' && isSettingsPanelVisible)) ? '14rem' : '2rem' 
              }}
            >
              <span className="px-2 py-2 text-gray-300 hidden sm:inline">Hi, {username}</span>
              <button
                onClick={async () => {
                  try {
                    await logout();
                  } catch (e) {
                    // ignore
                  } finally {
                    setIsAuthenticated(false);
                    setUsername('User');
                    setSpendings([]);
                    setSubscriptions([]);
                  }
                }}
                className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 hover:border-red-600 hover:text-white rounded-lg transition-all duration-300 shadow-sm"
              >
                Logout
              </button>
            </div>
          )}

          {/* Decorative elements for evil atmosphere */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        </div>
      </div>

      {/* AI Chat - Outside main layout for proper z-index */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* Add Spending Dialog */}
      <AddSpendingDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddSpendingFromDialog}
        existingCategories={categories}
        onAddCategory={handleAddCategory}
        currency={selectedCurrency}
        convertFromDisplayCurrency={convertFromDisplayCurrency}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Add Subscription Dialog */}
      <AddSubscriptionDialog
        isOpen={isAddSubscriptionDialogOpen}
        onClose={() => setIsAddSubscriptionDialogOpen(false)}
        onAdd={(data) => {
          void addSubscriptionToBackend({
            service: data.service,
            amount: data.amount,
            date: data.date,
            color: data.color,
            sendMail: data.sendMail,
          });
        }}
        existingServices={services}
        onAddService={handleAddService}
        currency={selectedCurrency}
        convertFromDisplayCurrency={convertFromDisplayCurrency}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Edit Subscription Dialog */}
      {editingSubscription && (
        <EditSubscriptionDialog
          isOpen={!!editingSubscription}
          onClose={() => setEditingSubscription(null)}
          initial={{
            service: editingSubscription.service,
            amount: editingSubscription.amount,
            date: editingSubscription.date,
            sendMail: editingSubscription.sendMail,
          }}
          existingServices={services}
          onAddService={handleAddService}
          currency={selectedCurrency}
          convertFromDisplayCurrency={convertFromDisplayCurrency}
          getCurrencySymbol={getCurrencySymbol}
          onSave={(payload) => {
            if (!editingSubscription) return;
            void updateSubscriptionInBackend(editingSubscription.id, {
              service: payload.service,
              amount: payload.amount,
              date: payload.date,
              color: editingSubscription.color,
              sendMail: payload.sendMail,
            });
          }}
          onDelete={() => {
            if (!editingSubscription) return;
            void deleteSubscriptionFromBackend(editingSubscription.id);
            setEditingSubscription(null);
          }}
        />
      )}

      {/* Language Dialog */}
      <LanguageDialog
        isOpen={isLanguageDialogOpen}
        onClose={() => setIsLanguageDialogOpen(false)}
        onSelectLanguage={handleSelectLanguage}
        selectedLanguage={selectedLanguage}
      />

      {/* Theme Dialog */}
      <ThemeDialog
        isOpen={isThemeDialogOpen}
        onClose={() => setIsThemeDialogOpen(false)}
        onSelectTheme={handleSelectTheme}
        selectedTheme={selectedTheme}
      />

      {/* Currency Dialog */}
      <CurrencyDialog
        isOpen={isCurrencyDialogOpen}
        onClose={() => setIsCurrencyDialogOpen(false)}
        onSelectCurrency={handleSelectCurrency}
        selectedCurrency={selectedCurrency}
      />

      {/* Sign Up Dialog */}
      <SignUpDialog
        isOpen={isSignUpDialogOpen}
        onClose={() => setIsSignUpDialogOpen(false)}
        onGoogleCredential={async (idToken) => {
          try {
            setAuthError(null);
            setAuthLoading(true);
            const user = await googleLogin(idToken);
            setUsername(user.first_name || user.username || 'User');
            setIsAuthenticated(true);
            setIsSignInDialogOpen(false);
            setIsSignUpDialogOpen(false);
            await initializeUserProfileAndSettings();
            await reloadExpenses();
          } catch (e: any) {
            setAuthError(e?.response?.data?.detail || e?.message || 'Google sign-in failed');
          } finally {
            setAuthLoading(false);
          }
        }}
        onSignUp={async (data) => {
          setAuthError(null);
          setAuthLoading(true);
          try {
            await register(data.username, data.email, data.password);
            await login(data.username, data.password);
            const u = await me();
            setUsername(u.username || 'User');
            setIsAuthenticated(true);
            await initializeUserProfileAndSettings();
            await reloadExpenses();
          } catch (e: any) {
            setAuthError(e?.response?.data?.detail || 'Sign up failed');
            console.error(e);
          } finally {
            setAuthLoading(false);
          }
        }}
      />

      {/* Sign In Dialog */}
      <SignInDialog
        isOpen={isSignInDialogOpen}
        onClose={() => setIsSignInDialogOpen(false)}
        onGoogleCredential={async (idToken) => {
          try {
            setAuthError(null);
            setAuthLoading(true);
            const user = await googleLogin(idToken);
            setUsername(user.first_name || user.username || 'User');
            setIsAuthenticated(true);
            setIsSignInDialogOpen(false);
            setIsSignUpDialogOpen(false);
            await initializeUserProfileAndSettings();
            await reloadExpenses();
          } catch (e: any) {
            setAuthError(e?.response?.data?.detail || e?.message || 'Google sign-in failed');
          } finally {
            setAuthLoading(false);
          }
        }}
        onSignIn={async (data) => {
          setAuthError(null);
          setAuthLoading(true);
          try {
            await login(data.username, data.password);
            const u = await me();
            setUsername(u.username || 'User');
            setIsAuthenticated(true);
            await initializeUserProfileAndSettings();
            await reloadExpenses();
          } catch (e: any) {
            setAuthError(e?.response?.data?.detail || 'Sign in failed');
            console.error(e);
          } finally {
            setAuthLoading(false);
          }
        }}
      />

      {/* Username Dialog */}
      <UsernameDialog
        isOpen={isUsernameDialogOpen}
        onClose={() => setIsUsernameDialogOpen(false)}
        currentUsername={username}
        onUpdateUsername={handleUpdateUsername}
      />

      {/* Budget Dialog */}
      <BudgetDialog
        isOpen={isBudgetDialogOpen}
        onClose={() => setIsBudgetDialogOpen(false)}
        currentBudget={budget}
        onUpdateBudget={handleUpdateBudget}
        currency={selectedCurrency}
        convertToDisplayCurrency={convertToDisplayCurrency}
        convertFromDisplayCurrency={convertFromDisplayCurrency}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Edit Spending Dialog */}
      {editingSpending && (
        <EditSpendingDialog
          isOpen={!!editingSpending}
          onClose={() => setEditingSpending(null)}
          initial={{
            category: editingSpending.category,
            amount: editingSpending.amount,
            date: editingSpending.date,
            description: editingSpending.description,
          }}
          existingCategories={categories}
          onAddCategory={handleAddCategory}
          currency={selectedCurrency}
          convertFromDisplayCurrency={convertFromDisplayCurrency}
          getCurrencySymbol={getCurrencySymbol}
          onSave={(payload) => {
            if (!editingSpending) return;
            void updateExpenseInBackend(editingSpending.id, payload);
          }}
          onDelete={() => {
            if (!editingSpending) return;
            void deleteExpenseFromBackend(editingSpending.id);
            setEditingSpending(null);
          }}
        />
      )}

      {/* Goal Dialog */}
      <GoalDialog
        isOpen={isGoalDialogOpen}
        onClose={() => setIsGoalDialogOpen(false)}
        currentGoal={goal}
        onUpdateGoal={handleUpdateGoal}
        currency={selectedCurrency}
        convertToDisplayCurrency={convertToDisplayCurrency}
        convertFromDisplayCurrency={convertFromDisplayCurrency}
        getCurrencySymbol={getCurrencySymbol}
      />
    </>
  );
}
