import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',

  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'nav-bg': '#0A0D10',
        'nav-bg2': '#10161B',
        'nav-glass': 'rgba(255, 255, 255, 0.05)',
        'nav-text': '#F4F7F8',
        'nav-text2': '#929DA5',
        'nav-teal': '#63E6D1',
        'nav-blue': '#82B9FF',
        'nav-warn': '#F5C66B',
        'nav-error': '#FF7777',
        'nav-success': '#7EE2A8',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#63E6D1',
          foreground: '#0A0D10',
        },
        secondary: {
          DEFAULT: '#82B9FF',
          foreground: '#0A0D10',
        },
        muted: {
          DEFAULT: '#10161B',
          foreground: '#929DA5',
        },
        accent: {
          DEFAULT: '#63E6D1',
          foreground: '#0A0D10',
        },
        destructive: {
          DEFAULT: '#FF7777',
          foreground: '#F4F7F8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(99, 230, 209, 0.3), 0 0 40px rgba(99, 230, 209, 0.1)',
        'glow-teal-sm': '0 0 10px rgba(99, 230, 209, 0.2)',
        'glow-teal-lg': '0 0 40px rgba(99, 230, 209, 0.4), 0 0 80px rgba(99, 230, 209, 0.15)',
        'glow-blue': '0 0 20px rgba(130, 185, 255, 0.3), 0 0 40px rgba(130, 185, 255, 0.1)',
        'glow-blue-sm': '0 0 10px rgba(130, 185, 255, 0.2)',
        'glow-warn': '0 0 20px rgba(245, 198, 107, 0.3)',
        'glow-error': '0 0 20px rgba(255, 119, 119, 0.3)',
        'glow-success': '0 0 20px rgba(126, 226, 168, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'nav': '0 4px 24px rgba(0, 0, 0, 0.5)',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.08)',
        'glass-hover': 'rgba(255, 255, 255, 0.15)',
        'teal': 'rgba(99, 230, 209, 0.3)',
        'blue': 'rgba(130, 185, 255, 0.3)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 10px rgba(99, 230, 209, 0.2)' },
          '50%': { opacity: '1', boxShadow: '0 0 30px rgba(99, 230, 209, 0.5)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'route-draw': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'route-draw': 'route-draw 2s ease-in-out',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-teal-blue': 'linear-gradient(135deg, #63E6D1, #82B9FF)',
        'gradient-dark': 'linear-gradient(180deg, #0A0D10 0%, #10161B 100%)',
        'glass-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.0) 100%)',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        'sidebar-collapsed': '64px',
        'sidebar-expanded': '240px',
        'topnav': '56px',
      },
      zIndex: {
        'sidebar': '40',
        'topnav': '50',
        'modal': '100',
        'toast': '110',
        'tooltip': '120',
      },
    },
  },
  plugins: [],
}

export default config
