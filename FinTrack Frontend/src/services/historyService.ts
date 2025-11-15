import { api, toQuery } from './api';

export async function getYearHistory(year: number) {
  const res = await api.get(`/api/history/${toQuery({ year })}`);
  return res.data as { year: number; months: Array<{ month: number; expenses: number; subscriptions: number; combined: number }> };
}

export async function getMonthHistory(params: { year: number; month: number; details?: boolean }) {
  const res = await api.get(`/api/history/${toQuery(params)}`);
  return res.data as {
    year: number;
    month: number;
    totals: { expenses: number; subscriptions: number; combined: number };
    expenses?: any[];
    subscriptions?: any[];
  };
}


