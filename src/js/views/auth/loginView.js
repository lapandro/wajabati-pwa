export function renderLoginView() {
  const appRoot = document.getElementById('app-root');

  appRoot.innerHTML = `
    <section class="login-container">
      <h2>تسجيل الدخول</h2>
      <form id="login-form">
        <input type="email" id="email" placeholder="البريد الإلكتروني" required />
        <input type="password" id="password" placeholder="كلمة المرور" required />
        <button type="submit">دخول</button>
        <p id="login-error" style="color: red;"></p>
      </form>
    </section>
  `;

  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const email = form.email.value;
    const password = form.password.value;

    try {
      const { loginUser } = await import('../../services/authService.js');
      await loginUser(email, password);

      // بعد تسجيل الدخول، توجه المستخدم حسب نوعه
      window.location.hash = '#/dashboard';
    } catch (error) {
      errorMsg.textContent = error.message || 'فشل تسجيل الدخول.';
    }
  });
}
