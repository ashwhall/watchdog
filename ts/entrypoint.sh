#!/bin/bash
set -e

# Ensure node_modules exists and has the right permissions
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing dependencies..."
    npm cache clean --force
    npm ci
    npm uninstall better-sqlite3
    npm install better-sqlite3 --build-from-source
fi

# Check if concurrently is available
if ! command -v concurrently &>/dev/null; then
    echo "concurrently not found, installing dependencies again..."
    npm ci
fi

# Execute the main command
exec "$@"
