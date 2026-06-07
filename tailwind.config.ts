import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#C8A96E',  // ouro
          dark:    '#A8843E',
          light:   '#E8D5A3',
        },
        surface: {
          DEFAULT: '#111318',  // fundo principal
          raised:  '#1A1D24',  // cards
          border:  '#2A2D35',  // bordas
        },
        score: {
          high:   '#EF4444',   // vermelho — oportunidade alta
          medium: '#F59E0B',   // âmbar   — oportunidade média
          low:    '#6B7280',   // cinza   — oportunidade baixa
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      screens: {
        xs: '390px',
      },
    },
  },
  plugins: [],
}

export default config
