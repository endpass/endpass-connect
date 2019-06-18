#!/bin/sh
# Clearing up past demo artifact
rm -rf ./e2e-apps/demo

# Git submodule initialization
git submodule init
git submodule update

# Building auth-application artifact
cd connect-demo
yarn link @endpass/connect
yarn
yarn build:e2e

# Returning to working dir
cd ../

# Creating auth artifact directory
mkdir -p ./e2e-apps/demo

# Copying application artifact
cp ./connect-demo/dist/* ./e2e-apps/demo
