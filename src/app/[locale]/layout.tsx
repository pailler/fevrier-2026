import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import '../globals.css';
import { TokenProvider } from '../../contexts/TokenContext';
import ClientHeader from '../../components/ClientHeader';
import Footer from '../../components/Footer';
import ConditionalComponents from '../../components/ConditionalComponents';
import ClientOnly from '../../components/ClientOnly';
import ScrollToTop from '../../components/ScrollToTop';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale} className="font-system">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NextIntlClientProvider messages={messages}>
          <TokenProvider>
            <ClientHeader />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ClientOnly>
              <ConditionalComponents />
              <ScrollToTop />
            </ClientOnly>
          </TokenProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

