'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface TokenContextType {
  tokens: number | null;
  loading: boolean;
  error: string | null;
  refreshTokens: () => Promise<void>;
  consumeTokens: (amount: number) => Promise<boolean>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  const { user } = useCustomAuth();
  const tokenBalance = useTokenBalance(user?.id || null);

  return (
    <TokenContext.Provider value={tokenBalance}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext(): TokenContextType {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
}
