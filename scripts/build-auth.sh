#!/bin/sh
# Clearing up past auth artifact
rm -rf ./e2e-apps/auth

# Git submodule initialization
git submodule init
git submodule update

# Building auth-application artifact
cd endpass-auth
yarn
yarn build:e2e

# Returning to working dir
cd ../

# Creating auth artifact directory
mkdir -p ./e2e-apps/auth
mkdir -p ./e2e-apps/auth/bridge

# Copying application artifact
cp -rf ./endpass-auth/dist/app/* ./e2e-apps/auth
cp -rf ./endpass-auth/dist/app/* ./e2e-apps/auth/bridge

# Installing auth service worker
sh ./scripts/install-auth-sw.sh
