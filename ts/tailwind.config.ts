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
        // Dark theme base colors
        dark: {
          bg: '#0a0a0a',
          surface: '#1a1a1a',
          elevated: '#2a2a2a',
          border: '#333333',
          text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
            muted: '#666666',
          },
        },
        // Rainbow accent colors
        rainbow: {
          red: '#ff6b6b',
          orange: '#ffa726',
          yellow: '#ffeb3b',
          green: '#66bb6a',
          blue: '#42a5f5',
          indigo: '#7e57c2',
          purple: '#ab47bc',
          pink: '#ec407a',
        },
        // Neon variants for extra flashiness
        neon: {
          cyan: '#00ffff',
          pink: '#ff00ff',
          green: '#39ff14',
          blue: '#1e90ff',
          purple: '#bf00ff',
          yellow: '#ffff00',
        },
      },
      animation: {
        'rainbow-border': 'rainbow-border 3s linear infinite',
        'rainbow-text': 'rainbow-text 3s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        'rainbow-border': {
          '0%': { borderColor: '#ff6b6b' },
          '14%': { borderColor: '#ffa726' },
          '28%': { borderColor: '#ffeb3b' },
          '42%': { borderColor: '#66bb6a' },
          '57%': { borderColor: '#42a5f5' },
          '71%': { borderColor: '#7e57c2' },
          '85%': { borderColor: '#ab47bc' },
          '100%': { borderColor: '#ff6b6b' },
        },
        'rainbow-text': {
          '0%': { color: '#ff6b6b' },
          '14%': { color: '#ffa726' },
          '28%': { color: '#ffeb3b' },
          '42%': { color: '#66bb6a' },
          '57%': { color: '#42a5f5' },
          '71%': { color: '#7e57c2' },
          '85%': { color: '#ab47bc' },
          '100%': { color: '#ff6b6b' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 5px rgba(66, 165, 245, 0.3)' },
          '100%': {
            boxShadow:
              '0 0 20px rgba(66, 165, 245, 0.8), 0 0 30px rgba(66, 165, 245, 0.4)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'rainbow-gradient':
          'linear-gradient(45deg, #ff6b6b, #ffa726, #ffeb3b, #66bb6a, #42a5f5, #7e57c2, #ab47bc)',
        'shimmer-gradient':
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
};

export default config;
