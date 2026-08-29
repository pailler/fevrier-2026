import type { Metadata } from 'next';

/** Toujours dynamiquer : le jeton d’accès est dans ?token= */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ResasSystemAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
