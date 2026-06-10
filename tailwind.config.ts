import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core surfaces
        obsidian:  '#0A0C0F',
        surface:   '#111318',
        elevated:  '#1A1D24',
        border:    '#252932',
        'border-light': '#2E3340',

        // Brand colours
        gold: {
          DEFAULT: '#F5A623',
          dim:     '#C4841C',
          glow:    'rgba(245,166,35,0.15)',
        },
        emerald: {
          DEFAULT: '#00C896',
          dim:     '#009E78',
        },
        crimson: {
          DEFAULT: '#E53E3E',
          dim:     '#C53030',
        },
        sky: {
          DEFAULT: '#3B8BEB',
          dim:     '#2D6EC4',
        },

        // Text
        text: {
          DEFAULT: '#F0F2F5',
          muted:   '#8891A5',
          dim:     '#4A5268',
        },
      },

      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        '2xs': ['10px', '14px'],
        xs:    ['11px', '16px'],
        sm:    ['13px', '18px'],
        base:  ['14px', '20px'],
        md:    ['15px', '22px'],
        lg:    ['17px', '24px'],
        xl:    ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['28px', '36px'],
        '4xl': ['34px', '42px'],
      },

      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
      },

      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },

      boxShadow: {
        'gold-glow':    '0 0 20px rgba(245,166,35,0.25)',
        'emerald-glow': '0 0 20px rgba(0,200,150,0.20)',
        'surface':      '0 4px 24px rgba(0,0,0,0.4)',
        'modal':        '0 24px 64px rgba(0,0,0,0.6)',
      },

      animation: {
        'pulse-slow':   'pulse 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.3s ease forwards',
        'fade-in':      'fadeIn 0.2s ease forwards',
        'ping-slow':    'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },

      keyframes: {
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
