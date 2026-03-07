import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NakedMD - Dashboard Login',
    template: 'NakedMD - %s',
  },
  description: 'NakedMD lead capture, concierge chat, and manager analytics dashboard.',
  icons: {
    icon: '/nmd-logo.png',
    shortcut: '/nmd-logo.png',
    apple: '/nmd-logo.png',
  },
  themeColor: '#0A0A0F',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
