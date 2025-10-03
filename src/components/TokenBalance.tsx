'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';

interface TokenBalanceProps {
  userId: string;
  className?: string;
}

export default function TokenBalance({ userId, className = '' }: TokenBalanceProps) {
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchTokenBalance();
  }, [userId]);

  const fetchTokenBalance = async () => {
    try {
      const response = await fetch(`/api/user-tokens?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setTokens(data.tokens || 0);
      } else {
        setTokens(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du solde de tokens:', error);
      setTokens(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const getTokenColor = (tokenCount: number) => {
    if (tokenCount === 0) return 'text-red-200';
    if (tokenCount < 50) return 'text-yellow-200';
    return 'text-green-200';
  };

  return (
    <Link
      href="/my-tokens"
      className={`inline-flex items-center space-x-2 ${className}`}
      title="Voir mes tokens"
    >
      <span className="text-lg">🪙</span>
      <span className={`font-medium ${getTokenColor(tokens || 0)}`}>
        {tokens !== null ? tokens : 0}
      </span>
    </Link>
  );
}

