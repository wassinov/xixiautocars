import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { GeistMono } from 'geist/font/mono';
import localFont from 'next/font/local';
import '@/app/globals.css';

// BUG-05 : polices self-hostées via next/font. Google Fonts étant injoignable depuis cette
// machine (build de prod impossible avec next/font/google), Syne et Outfit sont servies en
// local — woff2 variables dans ./fonts, extraites de @fontsource-variable — et Geist Mono
// vient du package `geist` (localFont embarqué). Les noms de variables sont ceux qu'attend
// tailwind.config.js (--font-syne / --font-outfit / --font-geist-mono).
const syne = localFont({
  src: './fonts/syne-Variable.woff2',
  variable: '--font-syne',
  display: 'swap',
});

const outfit = localFont({
  src: './fonts/outfit-Variable.woff2',
  variable: '--font-outfit',
  display: 'swap',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} data-scroll-behavior="smooth">
      <body className={`${syne.variable} ${outfit.variable} ${GeistMono.variable} font-body bg-ink-50 text-ink-900`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster /> {/* BUG-04 : conteneur global des notifications */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}