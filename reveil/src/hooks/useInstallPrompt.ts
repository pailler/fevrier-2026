'use client';

import { useCallback, useEffect, useState } from 'react';

const DISMISS_KEY = 'reveil_install_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPromptKind = 'loading' | 'installed' | 'native' | 'ios' | 'manual';

export interface InstallPromptState {
  kind: InstallPromptKind;
  dismissed: boolean;
  dismiss: () => void;
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isIpadOs = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  if (!isAppleMobile && !isIpadOs) return false;
  return !/CriOS|FxiOS|EdgiOS/.test(ua);
}

export function useInstallPrompt(): InstallPromptState {
  const [kind, setKind] = useState<InstallPromptKind>('loading');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  useEffect(() => {
    if (isStandalone()) {
      setKind('installed');
      return;
    }

    if (isIosSafari()) {
      setKind('ios');
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setKind('native');
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setKind('installed');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    setKind((current) => (current === 'loading' ? 'manual' : current));

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setKind('installed');
    }
    return outcome;
  }, [deferredPrompt]);

  return { kind, dismissed, dismiss, install };
}
