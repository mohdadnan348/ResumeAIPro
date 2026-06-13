// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata export - Only for SEO, title, description, etc.
export const metadata: Metadata = {
  title: 'ResumeAI Pro - Smart ATS Resume Scorer',
  description: 'AI-powered ATS resume scoring and improvement suggestions. Get instant feedback on your resume and increase your interview chances.',
  keywords: 'resume analyzer, ATS score, resume checker, AI resume review, job application',
  authors: [{ name: 'ResumeAI Pro' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ResumeAI Pro - Smart ATS Resume Scorer',
    description: 'Get AI-powered ATS score and suggestions to improve your resume',
    type: 'website',
    locale: 'en_US',
    siteName: 'ResumeAI Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeAI Pro - Smart ATS Resume Scorer',
    description: 'Get AI-powered ATS score and suggestions to improve your resume',
  },
};

// Viewport export - Separate export for viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}