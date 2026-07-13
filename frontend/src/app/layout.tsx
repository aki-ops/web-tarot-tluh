import type { Metadata } from 'next';
import { Montserrat, Phudu } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PageBackground } from '@/components/layout/PageBackground';

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  weight: ['200', '300', '400', '500', '600', '700'],
});

const phudu = Phudu({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'TLUH Tarot — Khám Phá Thông Điệp',
  description:
    'Trải nghiệm bốc bài Tarot tối giản và tinh tế. Trải bài 3 lá, rút nhanh 1 lá, và thư viện 78 lá bài.',
  keywords: ['tarot', 'bốc bài tarot', 'ý nghĩa 78 lá bài', 'tarot tluh', 'xem bói tarot'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${phudu.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <PageBackground />
        <SiteHeader />
        <main className="relative z-10 min-h-screen pt-16">{children}</main>
      </body>
    </html>
  );
}
