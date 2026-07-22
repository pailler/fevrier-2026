import { CardPageJsonLd } from '@/components/CardPageJsonLd'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hi3DGen — Image vers 3D | IA Home',
  description: 'Générez des modèles 3D à partir d\'images avec Hi3DGen. Haute fidélité géométrique via ComfyUI.',
};

export default function Hi3DGenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="hi3dgen" />
      {children}
    </>
  );
}
