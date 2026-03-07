import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#151515',
};

export const metadata: Metadata = {
  title: {
    default: 'NakedMD - Dashboard Login',
    template: 'NakedMD - %s',
  },
  description: 'NakedMD lead capture, concierge chat, and manager analytics dashboard.',
  icons: {
    icon: '/nmd-logo.svg',
    shortcut: '/nmd-logo.svg',
    apple: '/nmd-logo.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
