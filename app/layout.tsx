import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PAYE+ — Tanzania Tax Intelligence',
  description:
    'Production-grade salary calculator for Tanzania. Compute PAYE, NSSF, net pay, employer costs, and scenario comparisons with live tax schema.',
  keywords: ['Tanzania', 'PAYE', 'salary calculator', 'NSSF', 'TRA', 'tax', 'TZS', 'fintech'],
  authors: [{ name: 'PAYE+ Intelligence' }],
  robots: 'index, follow',
  openGraph: {
    title: 'PAYE+ — Tanzania Tax Intelligence',
    description: 'Fintech-grade salary & tax calculator for Tanzania',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#080B14',
  width: 'device-width',
  initialScale: 1,
  // Prevent iOS auto-zoom — maximumScale must stay at 1 only for layout stability
  // But we DO allow user scaling for accessibility (do not set user-scalable=no)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Blocking inline script: reads localStorage BEFORE first paint and sets
          the correct theme class on <html>. This prevents the flash of wrong
          theme (FOCT) that occurs when useEffect runs after hydration.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var t = localStorage.getItem('payeplus__theme');
    var prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = (t === 'dark' || t === 'light') ? t : prefer;
    document.documentElement.classList.add(theme);
    if (theme === 'light') {
      document.documentElement.style.setProperty('--bg-base','#F0F2FA');
      document.documentElement.style.setProperty('--bg-surface','#FFFFFF');
      document.documentElement.style.setProperty('--bg-elevated','#F8FAFF');
      document.documentElement.style.setProperty('--text-primary','#0F172A');
    }
  } catch(e){}
})();
            `.trim(),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
