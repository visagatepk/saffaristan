import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-jakarta)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#1B3060',
          light: '#EBF0F8',
          dark: '#0f1e3d',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#FBF5E0',
          dark: '#a8861f',
        },
      },
      backgroundImage: {
        'hero': "url('/hero-image.jpg')",
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-navy',
    'bg-navy-dark',
    'bg-navy-light',
    'bg-gold',
    'bg-gold-light',
    'bg-gold-dark',
    'text-navy',
    'text-gold',
    'border-navy',
    'border-gold',
  ],
}

export default config