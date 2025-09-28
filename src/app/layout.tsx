import type { Metadata } from "next";
import FontAwesomeLocal from '@/components/FontAwesomeLocal';
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdaptiveLayout from "../components/AdaptiveLayout";
import ConditionalComponents from "../components/ConditionalComponents";
import CSSOptimizer from "../components/CSSOptimizer";
import PerformanceOptimizer from "../components/PerformanceOptimizer";
import WebVitals from "../components/WebVitals";
import ResourceOptimizer from "../components/ResourceOptimizer";
import HTMLPreloadCleaner from "../components/HTMLPreloadCleaner";
import CSSPreloadManager from "../components/CSSPreloadManager";
import AggressivePreloadCleaner from "../components/AggressivePreloadCleaner";

// Utilisation de polices système pour éviter les preloads

export const metadata: Metadata = {
  title: {
    default: "IA Home - Plateforme d'Intelligence Artificielle | Formation IA & Outils IA",
    template: "%s | IA Home - Plateforme d'Intelligence Artificielle"
  },
  description: "Découvrez l'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Apprenez l'intelligence artificielle à votre rythme avec nos modules pratiques et nos cours adaptés à tous les niveaux.",
  keywords: [
    "intelligence artificielle",
    "IA",
    "formation IA",
    "Whisper",
    "Stable Diffusion", 
    "ComfyUI",
    "apprentissage IA",
    "tutoriel IA",
    "outils IA",
    "plateforme IA",
    "cours IA",
    "formation intelligence artificielle",
    "développement IA",
    "machine learning",
    "deep learning",
    "IA française"
  ],
  authors: [{ name: "IA Home", url: "https://iahome.fr" }],
  creator: "IA Home",
  publisher: "IA Home",
  applicationName: "IA Home",
  category: "Technology",
  classification: "Intelligence Artificielle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://iahome.fr'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': 'https://iahome.fr',
    },
  },
  openGraph: {
    title: "IA Home - Plateforme d'Intelligence Artificielle | Formation IA & Outils IA",
    description: "Découvrez l'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Apprenez l'intelligence artificielle à votre rythme.",
    url: 'https://iahome.fr',
    siteName: 'IA Home',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IA Home - Plateforme d\'Intelligence Artificielle - Formation et Outils IA',
        type: 'image/jpeg',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
    countryName: 'France',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: "IA Home - Plateforme d'Intelligence Artificielle | Formation IA & Outils IA",
    description: "Découvrez l'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Apprenez l'intelligence artificielle à votre rythme.",
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'IA Home',
    'application-name': 'IA Home',
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="font-system">
      <head>
        <FontAwesomeLocal />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <CSSOptimizer />
        <PerformanceOptimizer />
        <WebVitals />
        <ResourceOptimizer />
        <HTMLPreloadCleaner />
        <CSSPreloadManager />
        <AggressivePreloadCleaner />
        <AdaptiveLayout>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AdaptiveLayout>
        <ConditionalComponents />
      </body>
    </html>
  );
}