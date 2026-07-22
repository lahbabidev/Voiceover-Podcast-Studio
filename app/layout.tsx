import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'صانع البودكاست والتعليق الصوتي - Voiceover & Podcast Studio',
  description: 'منصة ذكية تحول النص إلى تعليق صوتي إعلاني وبودكاست متزامن بالفصحى والدارجة المغربية والفرنسية والإنجليزية',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Cairo',sans-serif] bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-amber-500 selection:text-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

