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
      href="/pricing"
      className={`inline-flex items-center space-x-2 ${className}`}
      title="Acheter des tokens"
    >
      <TokenBalance showIcon={showIcon} linkToPricing={false} />
    </Link>
  );
}
