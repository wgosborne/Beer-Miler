import type { Metadata } from 'next';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import './globals.css';

export const metadata: Metadata = {
  title: "Annie's Beer Mile",
  description: 'Friendly betting app for Annie beer mile performance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
