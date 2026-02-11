/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accent
        'cyan': {
          DEFAULT: '#4fc3f7',
          dim: '#0288d1',
          glow: 'rgba(79, 195, 247, 0.18)',
        },
        'purple': { DEFAULT: '#ce93d8', dim: '#7b1fa2' },
        // Status
        'success': '#4ade80',
        'warning': '#fbbf24',
        'danger': '#f87171',
        // Surfaces — deep space navy
        'base': '#070c16',
        'surface': '#0c1221',
        'card': '#111827',
        'elevated': '#1a2332',
        'hover': '#1e293b',
        // Text
        'primary': '#f1f5f9',
        'secondary': '#94a3b8',
        'muted': '#64748b',
        // Borders
        'border': {
          subtle: 'rgba(148, 163, 184, 0.05)',
          DEFAULT: 'rgba(148, 163, 184, 0.08)',
          hover: 'rgba(148, 163, 184, 0.15)',
        },
      },
      borderRadius: {
        'card': '16px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        },
      screens: {
        '3xl': '1920px',
      },
      maxWidth: {
        'dashboard': '1800px',
      },
    },
  },
  plugins: [],
};
