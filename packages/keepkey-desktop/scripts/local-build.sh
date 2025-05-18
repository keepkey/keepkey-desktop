#!/bin/bash

# Local build script for KeepKey Desktop
# This script helps with building and notarizing the app locally on macOS

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "This script is for macOS only"
  exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file for local build..."
  cat > .env << 'ENVEOF'
# Apple notarization credentials
APPLE_ID=your_apple_id@example.com
APPLE_ID_PASSWORD=your_app_specific_password
APPLE_TEAM_ID=
GH_TOKEN=your_github_token
ENVEOF
  echo "Please edit the .env file with your Apple credentials before building"
  exit 1
fi

# Load environment variables
source .env

echo "Building KeepKey Desktop app locally..."
echo "Using APPLE_TEAM_ID: $APPLE_TEAM_ID"

# Build the app
export NODE_ENV=production
export CSC_IDENTITY_AUTO_DISCOVERY=true

# Run the build
yarn run -T build && yarn run release 
