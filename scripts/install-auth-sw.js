const fs = require('fs-extra');

// # Copying service worker
fs.copySync('./tests/e2e/workers/auth.js', './e2e-apps/auth/sw-e2e.js', {
  dereference: true,
});

console.log('Auth service worker installed! 📦');
