import { api, toQuery } from './api';

export type ExpenseInput = {
  name: string;
  price: number | string;
  category_id?: number | null;
  time?: string | null;
  note?: string;
};

export async function listExpenses(params: { year?: number; month?: number } = {}) {
  const res = await api.get(`/api/expenses/${toQuery(params)}`);
  return res.data as {
    period: { year: number; month: number };
    summary: {
      monthly_goal: number;
      expenses_monthly: number;
      subscriptions_monthly: number;
      total_spendings: number;
      left_budget: number;
    };
    results: any[];
  };
}

export async function createExpense(payload: ExpenseInput) {
  const res = await api.post('/api/expenses/', payload);
  return res.data;
}

export async function updateExpense(id: number, payload: Partial<ExpenseInput>) {
  const res = await api.patch(`/api/expenses/${id}/`, payload);
  return res.data;
}

export async function deleteExpense(id: number) {
  const res = await api.delete(`/api/expenses/${id}/`);
  return res.data;
}

export async function getCategories() {
  const res = await api.get('/api/expenses/categories/');
  return res.data as Array<{ id: number; name: string }>;
}

export async function createCategory(name: string) {
  const res = await api.post('/api/expenses/categories/', { name });
  return res.data as { id: number; name: string };
}


