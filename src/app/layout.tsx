import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CivicAI — Autonomous Municipal Intelligence & Action Platform',
  description:
    'An elite AI-powered civic issue intelligence and municipal orchestration system. Turning real-time citizen voice into prioritized, explainable, and trackable public infrastructure action.',
  keywords: [
    'civic tech',
    'complaint management',
    'smart city',
    'public works',
    'AI governance',
    'municipal action',
    'explainable AI',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-blue-600 selection:text-white relative">
        <div className="fixed inset-0 bg-mesh-dark -z-20 pointer-events-none" />
        <div className="fixed inset-0 bg-grid-pattern opacity-20 -z-10 pointer-events-none" />
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
