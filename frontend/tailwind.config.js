/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        bg: {
          main: '#000000',
          surface: '#0a0a0a',
          'surface-2': '#111111',
          'surface-3': '#1a1a1a',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255,255,255,0.7)',
          muted: 'rgba(255,255,255,0.4)',
          faint: 'rgba(255,255,255,0.2)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease forwards',
      },
      maxWidth: {
        'content': '900px',
        'wide': '1200px',
      },
    },
  },
  plugins: [],
}
