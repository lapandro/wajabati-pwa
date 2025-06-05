export function renderSignupView() {
  const appRoot = document.getElementById('app-root');

  appRoot.innerHTML = `
    <section class="signup-container">
      <h2>إنشاء حساب جديد</h2>
      <form id="signup-form">
        <input type="email" id="email" placeholder="البريد الإلكتروني" required />
        <input type="password" id="password" placeholder="كلمة المرور" required />
        <input type="password" id="confirm-password" placeholder="تأكيد كلمة المرور" required />
        <button type="submit">تسجيل</button>
        <p id="signup-error" style="color: red;"></p>
        <p id="signup-success" style="color: green;"></p>
      </form>
    </section>
  `;

  const form = document.getElementById('signup-form');
  const errorMsg = document.getElementById('signup-error');
  const successMsg = document.getElementById('signup-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    successMsg.textContent = '';

    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form['confirm-password'].value;

    if (password !== confirmPassword) {
      errorMsg.textContent = 'كلمتا المرور غير متطابقتين.';
      return;
    }

    try {
      const { registerUser } = await import('../../services/authService.js');
      await registerUser(email, password);

      successMsg.textContent = 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.';
      form.reset();
    } catch (error) {
      errorMsg.textContent = error.message || 'حدث خطأ أثناء إنشاء الحساب.';
    }
  });
}