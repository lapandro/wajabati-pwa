// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html", // مسح جميع ملفات HTML في مجلد public
    "./src/**/*.js",     // مسح جميع ملفات JavaScript في مجلد src
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // تعريف خط Inter
      },
      colors: {
        // يمكنك تعريف ألوانك المخصصة هنا
        primary: '#F87171', // لون أحمر أساسي
        secondary: '#FCA5A5', // لون أحمر ثانوي
      }
    },
  },
  plugins: [],
}


