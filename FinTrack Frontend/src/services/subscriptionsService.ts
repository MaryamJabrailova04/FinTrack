import { api, toQuery } from './api';

export type SubscriptionInput = {
  name: string;
  price: number | string;
  category?: number | null;
  start_date: string;
  monthly_day: number;
  notify_email?: boolean;
  is_active?: boolean;
};

export async function listSubscriptions() {
  const res = await api.get('/api/subscriptions/');
  return res.data as any[];
}

export async function createSubscription(payload: SubscriptionInput) {
  const res = await api.post('/api/subscriptions/', payload);
  return res.data;
}

export async function updateSubscription(id: number, payload: Partial<SubscriptionInput>) {
  const res = await api.patch(`/api/subscriptions/${id}/`, payload);
  return res.data;
}

export async function deleteSubscription(id: number) {
  const res = await api.delete(`/api/subscriptions/${id}/`);
  return res.data;
}

export async function getSubscriptionCalendar(params: { year?: number; month?: number } = {}) {
  const res = await api.get(`/api/subscriptions/calendar/${toQuery(params)}`);
  return res.data as {
    year: number;
    month: number;
    totals: { subscriptions_count: number; subscriptions_monthly: number };
    days: Array<{ day: number; subscriptions: Array<{ id: number; name: string; price: number; category: string | null; notify_email: boolean }> }>;
  };
}


