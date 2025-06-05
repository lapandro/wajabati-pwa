import { renderSignupView } from './views/auth/signupView.js';
import { renderLoginView } from './views/auth/loginView.js';

const routes = {
  '#/signup': renderSignupView,
  '#/login': renderLoginView,
  // لاحقًا: '#/dashboard': renderDashboardView
};

export function router() {
  const path = window.location.hash;
  const view = routes[path];

  if (view) view();
  else renderLoginView(); // افتراضي
}