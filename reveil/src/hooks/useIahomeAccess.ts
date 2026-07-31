'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { IahomeAccess } from '@/lib/iahomeAuth';
import { readStoredToken, validateIahomeAccess } from '@/lib/iahomeAuth';

type AccessState =
  | { status: 'loading' }
  | { status: 'ready'; access: IahomeAccess }
  | { status: 'error'; message: string };

const REVEIL_GATE_COOKIE = 'reveil_iahome_gate';
const REVEIL_GATE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function setReveilGateCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${REVEIL_GATE_COOKIE}=1; path=/; max-age=${REVEIL_GATE_MAX_AGE_SEC}; SameSite=Lax; Secure`;
}

function appendTokenToUrl(token: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.get('token') === token) return;
  url.searchParams.set('token', token);
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
}

export function useIahomeAccess() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<AccessState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let tokenFromUrl = searchParams.get('token');
      const storedToken = readStoredToken();

      if (!tokenFromUrl && storedToken) {
        appendTokenToUrl(storedToken);
        tokenFromUrl = storedToken;
      }

      const token = tokenFromUrl ?? storedToken;

      if (!token) {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              'Un token d’accès est requis. Connectez-vous sur iahome.fr puis cliquez sur « Accéder » (accès gratuit).',
          });
        }
        return;
      }

      try {
        const access = await validateIahomeAccess(token);
        if (cancelled) return;
        setReveilGateCookie();
        appendTokenToUrl(token);
        setState({ status: 'ready', access });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Acces refuse',
          });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return state;
}
