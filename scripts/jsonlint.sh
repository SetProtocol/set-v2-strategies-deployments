#!/usr/bin/env bash

set -o errexit

echo "JSON linting outputs files"
echo "=========================="
echo "> ethereum/1-production";  jsonlint -q ethereum/deployments/outputs/1-production.json
echo "> ethereum/1-staging";     jsonlint -q ethereum/deployments/outputs/1-staging.json
echo "> ethereum/42-staging";    jsonlint -q ethereum/deployments/outputs/42-staging.json

echo "> polygon/137-production";   jsonlint -q polygon/deployments/outputs/137-production.json
echo "> polygon/137-staging";      jsonlint -q polygon/deployments/outputs/137-staging.json
echo "> polygon/80001-production"; jsonlint -q polygon/deployments/outputs/80001-staging.json

echo "> optimism/10-production";   jsonlint -q optimism/deployments/outputs/10-production.json
echo "> optimism/10-staging";      jsonlint -q optimism/deployments/outputs/10-staging.json
echo "> optimism/69-staging";      jsonlint -q optimism/deployments/outputs/69-staging.json
