import flowbite from "flowbite/plugin";

/** @type {import('tailwindcss').Config}*/
const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          0: '#110d08',
          50: '#231a10',
          100: '#342718',
          200: '#574229',
          300: '#795c39',
          400: '#9c7649',
          500: '#ad8351',
          600: '#b58f62',
          700: '#c6a885',
          800: '#d6c1a8',
          900: '#decdb9',
          1000: '#efe6dc',
        },
      }
    },
  },

  plugins: [
    flowbite(),
  ],

  darkMode: 'class',
};

module.exports = config;
