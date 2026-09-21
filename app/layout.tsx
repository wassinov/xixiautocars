import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: { default: 'Xixi Autocars', template: '%s | Xixi Autocars' },
  description: 'Vente de véhicules neufs et d\'occasion. Reprise, financement, garantie et entretien.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}