function startDemo() {
  cd e2e-apps/demo
  NODE_ENV=e2e npx serve -l 4000 -s
}

function startAuth() {
  cd e2e-apps/auth
  npx serve -l 8080 -s
}

startAuth & startDemo
