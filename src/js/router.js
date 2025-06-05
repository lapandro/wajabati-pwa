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

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
