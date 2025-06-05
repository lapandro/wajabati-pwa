// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'], // تأكد من إضافة خط Tajawal هنا
      },
      colors: {
        primary: '#F87171',
        secondary: '#FCA5A5',
      }
    },
  },
  plugins: [],
}

