export const TOKEN_STORAGE_KEY = 'reveil-intelligent-token';
export const MODULE_ID = 'reveil-intelligent';

export interface IahomeAccess {
  userId: string;
  userEmail?: string;
  token: string;
}

export function getIahomeOrigin(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_IAHOME_URL ?? 'https://iahome.fr';
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return process.env.NEXT_PUBLIC_IAHOME_URL ?? 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_IAHOME_URL ?? 'https://iahome.fr';
}

export function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const fromSession = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (fromSession) return fromSession;
  const fromLocal = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (fromLocal) return fromLocal;
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

export function persistToken(token: string): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function validateIahomeAccess(token: string): Promise<IahomeAccess> {
  const res = await fetch('/api/auth/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    clearStoredToken();
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? 'Acces refuse');
  }

  const data = (await res.json()) as { userId: string; userEmail?: string };
  if (!data.userId) throw new Error('Compte invalide');
  persistToken(token);
  return { userId: data.userId, userEmail: data.userEmail, token };
}
