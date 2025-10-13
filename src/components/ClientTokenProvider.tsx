'use client';

import { TokenProvider } from '../contexts/TokenContext';
import { ReactNode } from 'react';

interface ClientTokenProviderProps {
  children: ReactNode;
}

export default function ClientTokenProvider({ children }: ClientTokenProviderProps) {
  return (
    <TokenProvider>
      {children}
    </TokenProvider>
  );
}
