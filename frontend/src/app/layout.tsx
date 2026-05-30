import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '55Lounge | Where Beautiful Happens',
  description: 'Your premier destination for delectable food and refreshing cocktails.',
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
