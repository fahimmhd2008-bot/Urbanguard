import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Urbanguard — Modern Municipal Civic Action Platform',
  description:
    'Report civic problems, let AI organize and prioritize them, and track progress towards a better community with Urbanguard.',
  keywords: [
    'Urbanguard',
    'civic tech',
    'complaint management',
    'smart city',
    'public works',
    'municipal action',
    'citizen voice',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#263445] antialiased selection:bg-[#183B66] selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#183B66] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#183B66]"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" role="main" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
