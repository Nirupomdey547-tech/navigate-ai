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
        obsidian: '#000000',
        charcoal: '#09090B',
        graphite: '#121216',
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          elevated: 'rgba(255, 255, 255, 0.06)',
          strong: 'rgba(255, 255, 255, 0.09)',
        },
        hairline: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          subtle: 'rgba(255, 255, 255, 0.04)',
          hover: 'rgba(255, 255, 255, 0.22)',
        },
        // Backward compatibility mappings
        'nav-bg': '#000000',
        'nav-bg2': '#09090B',
        'nav-glass': 'rgba(255, 255, 255, 0.04)',
        'nav-text': '#FFFFFF',
        'nav-text2': '#A1A1AA',
        'nav-teal': '#E4E4E7',
        'nav-blue': '#D4D4D8',
        'nav-warn': '#F5C66B',
        'nav-error': '#EF4444',
        'nav-success': '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'liquid-glass': '0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)',
        'liquid-glass-elevated': '0 30px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 2px 0 rgba(255, 255, 255, 0.25)',
        'liquid-glass-subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'specular-glow': '0 0 25px rgba(255, 255, 255, 0.15)',
        'specular-glow-lg': '0 0 50px rgba(255, 255, 255, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
