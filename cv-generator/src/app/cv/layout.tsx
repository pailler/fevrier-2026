import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Éditeur CV — Générateur de CV IA | cv.iahome.fr',
  description: 'Créez et exportez votre CV optimisé ATS avec l’IA.',
};

export default function CvAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
