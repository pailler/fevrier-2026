'use client';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
}

export default function AdaptiveLayout({ children }: AdaptiveLayoutProps) {
  // Toujours utiliser pt-0 maintenant que nous avons supprimé la zone blanche
  return (
    <main className="pt-0">
      {children}
    </main>
  );
}


