import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Générateur de CV IA — CV optimisé ATS | cv.iahome.fr",
  description:
    "Créez un CV professionnel optimisé pour les ATS. Import PDF ou LinkedIn, adaptation au poste, score ATS, lettre de motivation et export PDF. Propulsé par IAHome.",
  keywords: [
    "générateur cv",
    "cv ia",
    "cv ats",
    "curriculum vitae",
    "lettre de motivation",
    "linkedin cv",
    "cv en ligne",
    "iahome",
  ],
  alternates: {
    canonical: "https://cv.iahome.fr",
  },
  openGraph: {
    title: "Générateur de CV IA — cv.iahome.fr",
    description:
      "CV optimisé ATS, import LinkedIn, lettre de motivation et export PDF avec l'intelligence artificielle.",
    url: "https://cv.iahome.fr",
    siteName: "IAHome",
    locale: "fr_FR",
    type: "website",
  },
  robots: { index: true, follow: true },
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
