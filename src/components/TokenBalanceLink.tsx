'use client';
import Link from 'next/link';
import TokenBalance from './TokenBalance';

interface TokenBalanceLinkProps {
  className?: string;
  showIcon?: boolean;
}

export default function TokenBalanceLink({ className = '', showIcon = true }: TokenBalanceLinkProps) {
  return (
    <Link
      href="/encours"
      className={`inline-flex items-center space-x-2 ${className}`}
      title="Voir mes tokens"
    >
      <TokenBalance showIcon={showIcon} />
    </Link>
  );
}
