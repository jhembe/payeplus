import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Zinc scale — warm near-black
        zinc: {
          950: '#09090B',
          900: '#18181B',
          800: '#27272A',
          700: '#3F3F46',
          600: '#52525B',
          500: '#71717A',
          400: '#A1A1AA',
          300: '#D4D4D8',
          200: '#E4E4E7',
          100: '#F4F4F5',
          50:  '#FAFAFA',
        },
        // Gold/Amber — primary brand accent
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Semantic
        sage: {
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        sky: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
        },
        // Legacy aliases for backwards compat
        brand: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        serif:   ['var(--font-serif)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
        display: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
        'gradient-brand-subtle': 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.06) 100%)',
      },
      boxShadow: {
        'gold-sm':  '0 0 16px rgba(245,158,11,0.14)',
        'gold-md':  '0 0 32px rgba(245,158,11,0.18)',
        'gold-lg':  '0 0 64px rgba(245,158,11,0.22)',
        'card':     '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 8px rgba(0,0,0,0.55), 0 8px 32px rgba(0,0,0,0.3)',
        'card-lg':  '0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 16px rgba(0,0,0,0.65), 0 16px 48px rgba(0,0,0,0.4)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':  'fadeIn 0.3s ease-out',
        'shimmer':  'shimmer 2s linear infinite',
        'glow':     'glow-pulse 3s ease-in-out infinite',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
