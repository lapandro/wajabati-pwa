import { renderLoginView } from './views/auth/loginView.js';

const routes = {
  '#/login': renderLoginView,
  // لاحقًا: '#/dashboard': renderDashboardView
};

export function router() {
  const path = window.location.hash;
  const view = routes[path];
  if (view) view();
  else renderLoginView(); // صفحة افتراضية
}

import { renderSignupView } from './views/auth/signupView.js';

const routes = {
  '#/login': renderLoginView,
  '#/signup': renderSignupView,
  // لاحقًا: '#/dashboard': renderDashboardView
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
