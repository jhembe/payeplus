import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PAYE+ — Tanzania Tax Intelligence',
  description:
    'Fintech-grade salary calculator for Tanzania. Compute PAYE, NSSF, net pay, employer costs, and scenario comparisons — works offline.',
  keywords: ['Tanzania', 'PAYE', 'salary calculator', 'NSSF', 'TRA', 'tax', 'TZS', 'fintech'],
  authors: [{ name: 'PAYE+' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PAYE+',
  },
  openGraph: {
    title: 'PAYE+ — Tanzania Tax Intelligence',
    description: 'Fintech-grade salary & tax calculator for Tanzania',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0D' },
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        {/*
          Blocking inline script: reads localStorage BEFORE first paint and sets
          the correct theme class + CSS vars on <html> to prevent FOCT.
          Updated for new gold/zinc palette.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('payeplus__theme');var prefer=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var theme=(t==='dark'||t==='light')?t:prefer;document.documentElement.classList.add(theme);if(theme==='light'){document.documentElement.style.setProperty('--bg-base','#F6F6F4');document.documentElement.style.setProperty('--bg-surface','#FFFFFF');document.documentElement.style.setProperty('--bg-elevated','#EDEDEB');document.documentElement.style.setProperty('--text-primary','#18181B');document.documentElement.style.setProperty('--text-secondary','#27272A');document.documentElement.style.setProperty('--text-muted','#71717A');document.documentElement.style.setProperty('--gold','#D97706');document.documentElement.style.setProperty('--header-bg','rgba(246,246,244,0.92)');document.documentElement.style.setProperty('--nav-bg','rgba(255,255,255,0.97)');}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
