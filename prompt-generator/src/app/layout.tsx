import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Générateur de Prompts - Prompt Engineering | IA Home",
  description: "Créez des prompts optimisés pour ChatGPT et autres modèles de langage en utilisant les meilleures pratiques du prompt engineering.",
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


