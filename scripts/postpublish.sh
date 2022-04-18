#!/usr/bin/env bash

set -o errexit

cp github.README.md README.md
rm github.README.md

cp github.package.json package.json
rm github.package.json
