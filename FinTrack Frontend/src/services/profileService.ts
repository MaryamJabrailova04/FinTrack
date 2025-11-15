import { api } from './api';

export async function getProfileMe() {
  const res = await api.get('/api/profile/me/');
  return res.data;
}

export async function updateProfileMe(patch: Partial<{ first_name: string; monthly_goal: number | string }>) {
  const res = await api.patch('/api/profile/me/', patch);
  return res.data;
}


