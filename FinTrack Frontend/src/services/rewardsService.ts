import { api } from './api';

export async function getRewards() {
  const res = await api.get('/api/rewards/');
  return res.data as { rewards: any[]; earned: any[] };
}


