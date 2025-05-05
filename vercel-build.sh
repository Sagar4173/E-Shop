#!/bin/bash

# Exit on error
set -e

# Print working directory
echo "Current directory: $(pwd)"
echo "Listing contents of root directory:"
ls -la

# Navigate to Client directory
cd Client || { echo "Failed to change to Client directory"; exit 1; }
echo "Changed to Client directory: $(pwd)"

# Install dependencies
echo "Installing client dependencies..."
npm install || { echo "Failed to install client dependencies"; exit 1; }

# Build the client
echo "Building client..."
npm run build || { echo "Failed to build client"; exit 1; }

echo "Client build completed successfully!"
echo "Contents of dist directory:"
ls -la dist

# Return to root directory
cd ..

# Navigate to Server directory and install dependencies
cd Server || { echo "Failed to change to Server directory"; exit 1; }
echo "Changed to Server directory: $(pwd)"

echo "Installing server dependencies..."
npm install || { echo "Failed to install server dependencies"; exit 1; }

echo "All builds completed successfully!"