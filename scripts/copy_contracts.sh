#!/usr/bin/env bash

yarn clean-artifacts
mkdir contracts
cp -rf node_modules/@setprotocol/set-v2-strategies/contracts/* ./contracts/.
