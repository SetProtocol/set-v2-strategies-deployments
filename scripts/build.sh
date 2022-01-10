#!/usr/bin/env bash

set -o errexit

yarn copy-contracts
cd ethereum && yarn compile && cd ..
cd ethereum && yarn typechain && cd ..
yarn transpile:ethereum --skipLibCheck
yarn transpile:polygon --skipLibCheck
yarn transpile:arbitrum --skipLibCheck
yarn transpile:optimism --skipLibCheck
yarn transpile:avalanche --skipLibCheck
