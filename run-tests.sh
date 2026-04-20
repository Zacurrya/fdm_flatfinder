#!/usr/bin/bash

set -euo pipefail

# Ensure script runs from repository root regardless of caller location.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# Git Bash on Windows may expose npm as npm.cmd instead of npm.
if command -v npm >/dev/null 2>&1; then
	NPM_BIN="npm"
elif command -v npm.cmd >/dev/null 2>&1; then
	NPM_BIN="npm.cmd"
else
	echo "Error: npm is not available in PATH for this shell."
	exit 127
fi

echo "Running tests..."
"${NPM_BIN}" run test -- --watchAll=false

echo "Tests passed. Starting app..."
"${NPM_BIN}" run start