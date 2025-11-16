import { api } from './api';
import { setTokens, clearTokens } from './token';

export async function login(username: string, password: string): Promise<void> {
  const res = await api.post('/api/auth/token/', { username, password });
  const tokens = { access: res.data.access as string, refresh: res.data.refresh as string };
  setTokens(tokens);
}

export async function register(username: string, email: string, password: string): Promise<void> {
  await api.post('/api/accounts/register/', { username, email, password });
}

export async function logout(): Promise<void> {
  try {
    // best-effort blacklist refresh
    const refresh = localStorage.getItem('ft_refresh_token');
    if (refresh) {
      await api.post('/api/accounts/logout/', { refresh });
    }
  } catch {
    // ignore errors during logout
  } finally {
    clearTokens();
  }
}

export async function me(): Promise<{ id: number; username: string; email: string; first_name: string }> {
  const res = await api.get('/api/accounts/me/');
  return res.data;
}

export async function googleLogin(idToken: string): Promise<{ id: number; username: string; email: string; first_name: string }> {
  const res = await api.post('/api/accounts/google-login/', { id_token: idToken });
  const tokens = { access: res.data.access as string, refresh: res.data.refresh as string };
  setTokens(tokens);
  return res.data.user as { id: number; username: string; email: string; first_name: string };
}


