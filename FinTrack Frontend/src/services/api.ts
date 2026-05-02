import axios, { AxiosError, AxiosInstance } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, withRefreshLock } from './token';

const rawEnvUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const resolvedEnvUrl = rawEnvUrl?.replace(/\/api$/i, '');
const baseURL = resolvedEnvUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

export const api: AxiosInstance = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set correct multipart boundary for FormData
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData && config.headers) {
    // axios will set the proper Content-Type with boundary automatically
    delete (config.headers as any)['Content-Type'];
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await axios.post(`${baseURL}/api/auth/token/refresh/`, { refresh });
    const newAccess = res.data?.access;
    if (typeof newAccess === 'string' && newAccess.length > 0) {
      setAccessToken(newAccess);
      return newAccess;
    }
  } catch (_e) {
    // fall through
  }
  clearTokens();
  return null;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthReq = original?.url?.includes('/api/auth/');
    if (status === 401 && original && !isAuthReq && !(original as any)._retry) {
      (original as any)._retry = true;
      const newToken = await withRefreshLock(refreshAccessToken);
      if (newToken) {
        original.headers = original.headers || {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
    }
    return Promise.reject(error);
  }
);

export function toQuery(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}


