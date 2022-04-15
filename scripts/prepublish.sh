#!/usr/bin/env bash

set -o errexit

rm -rf deployments

# Create publication folder
mkdir deployments
mkdir deployments/ethereum
mkdir deployments/optimism
mkdir deployments/polygon

# Copy publishable assets to publication folder
cp ethereum/deployments/outputs/1-production.json deployments/ethereum/production.json
cp ethereum/deployments/outputs/1-staging.json deployments/ethereum/staging.json

cp optimism/deployments/outputs/10-production.json deployments/optimism/production.json
cp optimism/deployments/outputs/10-staging.json deployments/optimism/staging.json

cp polygon/deployments/outputs/137-production.json deployments/polygon/production.json
cp polygon/deployments/outputs/137-staging.json deployments/polygon/staging.json

# Copy npm README version to README (this will be reversed in the postpublish hook)
cp README.md github.README.md
cp publish/npm.README.md README.md

cp package.json github.package.json
cp publish/npm.package.json package.json
