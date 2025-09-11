/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/skins/**/*.{js,jsx,ts,tsx}', // include skins
  ],
  theme: {
    extend: {
      colors: {
        brandGreen: '#1C9A3E',
        brandBlue: '#003C71',
        brandGray: '#808080',
        darkBase: '#222222',
      },
    },
  },
  plugins: [],
};
