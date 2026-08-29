import type { Metadata } from 'next';
import { CODE_LEARNING_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: CODE_LEARNING_PUBLIC_ORIGIN },
};

export default function CodeLearningSeoExampleRedirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
