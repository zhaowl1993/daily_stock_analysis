#!/usr/bin/env bash
# Render.com build script
# Installs Python deps + builds frontend (Node.js)

set -o errexit  # exit on error

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Installing Node.js for frontend build..."
# Render provides Node.js via nix, but we install it explicitly to be safe
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "==> Node version: $(node --version)"
echo "==> npm version: $(npm --version)"

echo "==> Building frontend..."
cd apps/dsa-web
npm ci
npm run build
cd ../..

echo "==> Verifying frontend build..."
if [ -f "static/index.html" ]; then
    echo "==> Frontend build successful! static/index.html exists."
    ls -la static/
else
    echo "==> WARNING: static/index.html not found!"
    ls -la static/ 2>/dev/null || echo "==> static/ directory does not exist"
fi

echo "==> Build complete!"

