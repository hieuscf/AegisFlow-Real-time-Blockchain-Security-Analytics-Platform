/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        aegis: {
          bg: '#050816',
          surface: '#0B1120',
          card: '#0D1A2E',
          elevated: '#1a1b22',
          glass: 'rgba(20, 21, 26, 0.88)',
          border: '#1A2840',
          primary: '#00E5FF',
          secondary: '#7C3AED',
          success: '#00FF85',
          danger: '#FF4D6D',
          warning: '#F59E0B',
          muted: '#94A3B8',
          mint: '#00ffa3',
          'mint-dim': '#00cc82',
          'mint-muted': 'rgba(0, 255, 163, 0.12)',
          negative: '#ff4d4d',
          critical: '#ff4d4d',
          info: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        glow: '0 0 24px rgba(0, 255, 163, 0.18), inset 0 0 0 1px rgba(0, 255, 163, 0.08)',
        'glow-sm': '0 0 12px rgba(0, 255, 163, 0.12)',
      },
      backdropBlur: {
        glass: '12px',
      },
      keyframes: {
        'pulse-critical': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255, 77, 77, 0.4)' },
          '50%': { opacity: '0.75', boxShadow: '0 0 12px 2px rgba(255, 77, 77, 0.25)' },
        },
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), 0 0 60px rgba(0, 229, 255, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 229, 255, 0.5), 0 0 80px rgba(0, 229, 255, 0.2)',
          },
        },
      },
      animation: {
        'pulse-critical': 'pulse-critical 1.5s ease-in-out infinite',
        'pulse-live': 'pulse-live 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
