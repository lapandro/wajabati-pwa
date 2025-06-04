echo 'document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app-root");
  app.innerHTML = `
    <h2 style="color: #ff5722;">🔥 تم التحديث مباشرة من GitHub!</h2>
تعديل من GitHub مباشر لتجربة النشر التلقائي
    <p>هذا المحتوى تم تحميله بنجاح من <code>main.js</code> ✅</p>
    <button id="helloBtn" style="margin-top: 1rem; padding: 10px 20px; font-size: 16px;">جربني 👋</button>
  `;
  document.getElementById("helloBtn").addEventListener("click", () => {
    alert("مرحبًا بك! 👋 هذا الزر يعمل!");
  });
});' > public/main.js