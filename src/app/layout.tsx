import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
