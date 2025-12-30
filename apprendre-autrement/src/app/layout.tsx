import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apprendre Autrement - Éducation Adaptée",
  description: "Des activités super amusantes pour apprendre au rythme de chacun ! Parfait pour les enfants avec des besoins spécifiques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}





