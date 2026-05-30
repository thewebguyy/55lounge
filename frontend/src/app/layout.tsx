import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servia | Premium Restaurant Operations Platform',
  description: 'The high-performance operations and fulfillment engine for modern hospitality.',
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
