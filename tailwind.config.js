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
        storm: ['storm', 'sans-serif'],
      },
      screens: {
        xs: '480px',
      },
      boxShadow: {
        panel:
          '0 25px 50px -12px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(255 255 255 / 0.06)',
        'panel-sm':
          '0 10px 25px -5px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(255 255 255 / 0.05)',
        nav: '0 4px 24px -4px rgb(0 0 0 / 0.4)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-pulse': 'fade-pulse 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
