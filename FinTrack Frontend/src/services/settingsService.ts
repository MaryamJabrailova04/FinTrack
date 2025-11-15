import { api } from './api';

export async function getSettingsMe() {
  const res = await api.get('/api/settings/me/');
  return res.data as {
    language: string;
    theme: string;
    currency: string;
    email_notifications: boolean;
    timezone: string;
    savings_goal?: number | string;
  };
}

export async function updateSettingsMe(patch: Partial<{ language: string; theme: string; currency: string; email_notifications: boolean; timezone: string; savings_goal: number | string }>) {
  const res = await api.patch('/api/settings/me/', patch);
  return res.data;
}


