import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'XENO Protocol', description: 'The Cold Synthesizer.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-cyan-300/95 antialiased">{children}</body>
    </html>
  );
}