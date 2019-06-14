#!/bin/sh
start_demo()
{
  cd e2e-apps/demo
  NODE_ENV=e2e npx serve -l 4444 -s
}

start_auth()
{
  cd e2e-apps/auth
  npx serve -l 8888 -s
}

start_auth & start_demo
