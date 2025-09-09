import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdaptiveLayout from "../components/AdaptiveLayout";
import ConditionalComponents from "../components/ConditionalComponents";
import CSSOptimizer from "../components/CSSOptimizer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IAhome - Plateforme IA",
  description: "Accès direct à la puissance et aux outils IA",
  other: {
    // Optimisation du préchargement des ressources
    'preload-css': 'true',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CSSOptimizer />
        <Header />
        <AdaptiveLayout>
          {children}
        </AdaptiveLayout>
        <Footer />
        <ConditionalComponents />
      </body>
    </html>
  );
}
