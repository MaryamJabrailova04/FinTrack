export type Tokens = { access: string; refresh: string };

const ACCESS_KEY = 'ft_access_token';
const REFRESH_KEY = 'ft_refresh_token';

let refreshInFlight: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: Tokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function setAccessToken(access: string): void {
  localStorage.setItem(ACCESS_KEY, access);
}

export function withRefreshLock(task: () => Promise<string | null>): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = task().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}


