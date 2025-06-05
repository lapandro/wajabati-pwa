'document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app-root");
  app.innerHTML = `
    <h2 style="color: #4A90E2;">مرحبًا بك في تطبيق وجباتي 🍽️</h2>
    <p>هذا المحتوى تم تحميله بنجاح من <code>main.js</code> ✅</p>
    <button id="helloBtn" style="margin-top: 1rem; padding: 10px 20px; font-size: 16px;">جربني 👋</button>
  `;
 
console.log("🔥 تم النشر التلقائي من GitHub إلى Firebase!");
 document.getElementById("helloBtn").addEventListener("click", () => {
    alert("مرحبًا بك! 👋 هذا الزر يعمل!");
  });
});' > public/main.js