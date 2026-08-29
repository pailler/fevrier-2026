import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/psitransfer',
  title: 'PsiTransfer — transfert de fichiers sécurisé',
  description:
    'Transférez et partagez vos fichiers de manière sécurisée avec PsiTransfer IAHome. Liens temporaires, chiffrement et contrôle total.',
  keywords: [
    'transfert fichier',
    'partage fichier sécurisé',
    'PsiTransfer IAHome',
    'upload fichier',
    'alternative wetransfer',
  ],
});

export default function PsiTransferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
