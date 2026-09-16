/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        space: ['"Space Grotesk"', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        neo: {
          bg: '#FFF7FF',
          dark: '#2B2630',
          yellow: '#FFF176',
          mint: '#A8E6CF',
          pink: '#FF9EB1',
          toska: '#C7F9EE',
          orange: '#FFD3B6',
          purple: '#E2D4F9',
          blue: '#A0C4FF',
          red: '#FF8B8B',
          gray: '#F0ECF4',
        }
      },
      boxShadow: {
        neo: '4px 4px 0px 0px #2B2630',
        'neo-sm': '2px 2px 0px 0px #2B2630',
        'neo-lg': '6px 6px 0px 0px #2B2630',
        'neo-xl': '8px 8px 0px 0px #2B2630',
        'neo-yellow': '4px 4px 0px 0px #FFF176',
        'neo-pink': '4px 4px 0px 0px #FF9EB1',
      },
      borderWidth: {
        '2.5': '2.5px',
        '3': '3px',
      }
    },
  },
  plugins: [],
}
