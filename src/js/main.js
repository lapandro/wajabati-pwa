import '../css/input.css'; // أو استايلك الخاص

import { router } from './router.js';

window.addEventListener('load', router);
window.addEventListener('hashchange', router);