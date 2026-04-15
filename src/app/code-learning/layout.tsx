import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/code-learning',
  title: 'Apprendre le code avec l’IA — parcours Code Learning',
  description:
    'Ressources et parcours pour progresser en programmation avec l’aide de l’intelligence artificielle. Module Code Learning sur IAHome.',
  keywords: [
    'apprendre code IA',
    'formation code débutant',
    'programmation IA',
    'Code Learning',
    'cours code en ligne',
    'IAHome code',
  ],
});

export default function CodeLearningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
