#!/bin/bash
set -e

# Print working directory
echo "Current directory: $(pwd)"

# Navigate to Client directory
cd Client || exit 1
echo "Changed to Client directory: $(pwd)"

# Create .npmrc file directly in the build environment
cat > .npmrc << EOL
node-linker=hoisted
legacy-peer-deps=true
shamefully-hoist=true
strict-peer-dependencies=false
rollup_skip_nodejs_native=1
workspaces=false
EOL

# Force Rollup to use the JS implementation
export ROLLUP_SKIP_NODEJS_NATIVE=1
export ROLLUP_NATIVE=0
export NPM_CONFIG_WORKSPACES=false

# Clean install with specific Vite version that works better in Vercel
echo "Installing specific package versions..."
rm -f package-lock.json
npm install --no-package-lock --workspaces=false --include=dev
npm install esbuild@0.18.20 --save-exact --workspaces=false

# Build with environment variables to skip native modules
echo "Building client..."
unset NPM_CONFIG_WORKSPACES
# Vite build includes TypeScript compilation
ROLLUP_NATIVE=0 npx vite build --mode production

echo "Client build completed successfully!"

# Return to root directory
cd ..

# No explicit build needed for Server, but we'll install dependencies
cd Server || exit 1
echo "Changed to Server directory: $(pwd)"

echo "Installing server dependencies..."
rm -f package-lock.json
npm install --no-package-lock --workspaces=false

echo "All builds completed successfully!"