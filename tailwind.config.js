// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // القسم الأهم: يحدد المسارات التي يجب على Tailwind مسحها للبحث عن كلاسات CSS
  // تأكد أن هذه المسارات تتطابق تمامًا مع مكان ملفاتك التي تستخدم كلاسات Tailwind
  content: [
    // هذا المسار يشمل جميع ملفات .html داخل مجلد 'public' وجميع مجلداته الفرعية.
    // على سبيل المثال: public/index.html
    "./public/**/*.html",
    // هذا المسار يشمل جميع ملفات .js داخل مجلد 'src' وجميع مجلداته الفرعية.
    // على سبيل المثال: src/js/main.js, src/js/components/**/*.js, src/js/views/**/*.js
    "./src/**/*.js",
  ],
  theme: {
    extend: {
      // تعريف خط مخصص اسمه 'inter' لاستخدامه في Tailwind
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      // تعريف ألوان مخصصة إذا أردت استخدامها ككلاسات Tailwind
      colors: {
        primary: '#F87171', // لون أحمر أساسي
        secondary: '#FCA5A5', // لون أحمر ثانوي
      }
    },
  },
  plugins: [], // إضافة أي إضافات (plugins) لـ Tailwind هنا إذا لزم الأمر
}

