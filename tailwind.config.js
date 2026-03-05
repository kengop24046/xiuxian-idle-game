/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37',
        secondary: '#1A365D',
        dark: '#0F172A',
        light: '#F8FAFC',
        danger: '#DC2626',
        success: '#10B981',
        quality: {
          common: '#9CA3AF',
          good: '#22C55E',
          fine: '#3B82F6',
          excellent: '#8B5CF6',
          epic: '#F59E0B',
          spirit: '#EF4444',
          immortal: '#D4AF37',
          god: '#EC4899',
        }
      },
      fontFamily: {
        xianxia: ['"Noto Serif SC"', 'serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}