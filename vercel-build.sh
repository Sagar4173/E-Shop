#!/bin/bash

# Print working directory
echo "Current directory: $(pwd)"

# Navigate to Client directory
cd Client || exit 1
echo "Changed to Client directory: $(pwd)"

# Install dependencies
echo "Installing dependencies..."
npm install || exit 1

# Build the client
echo "Building client..."
npm run build || exit 1

echo "Client build completed successfully!"

# Return to root directory
cd ..

# No explicit build needed for Server, but we'll install dependencies
cd Server || exit 1
echo "Changed to Server directory: $(pwd)"

echo "Installing server dependencies..."
npm install || exit 1

echo "All builds completed successfully!"