import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern dark theme with better contrast
        background: '#0a0a0a',
        surface: '#1a1a1a',
        card: '#252528',
        elevated: '#35353a',

        // Text hierarchy
        text: {
          primary: '#ffffff',
          secondary: '#8e8e93',
          tertiary: '#636366',
        },

        // Single accent with variations
        accent: {
          DEFAULT: '#007aff',
          hover: '#0056cc',
          subtle: 'rgba(0, 122, 255, 0.1)',
          border: 'rgba(0, 122, 255, 0.2)',
        },

        // Semantic colors
        success: '#30d158',
        warning: '#ff9f0a',
        error: '#ff453a',

        // Border colors
        border: '#35353a',
      },

      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      boxShadow: {
        soft: '0 1px 3px rgba(0, 0, 0, 0.3)',
        medium: '0 4px 12px rgba(0, 0, 0, 0.4)',
        large: '0 12px 24px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px rgba(0, 122, 255, 0.3)',
      },

      animation: {
        'slide-up': 'slideInUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
      },

      keyframes: {
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },

      fontFamily: {
        sans: [
          'var(--font-geist-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
};

export default config;
