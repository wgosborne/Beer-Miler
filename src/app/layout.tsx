import type { Metadata } from 'next';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import { Header } from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: "Annie's Beer Mile",
  description: 'Friendly betting app for Annie beer mile performance',
  viewport: 'width=device-width, initial-scale=1.0',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SessionProviderWrapper>
          <Header />
          <main className="flex-1">{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
