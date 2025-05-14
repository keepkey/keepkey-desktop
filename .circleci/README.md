# CircleCI Windows Build Setup for KeepKey Desktop

This directory contains configuration for building KeepKey Desktop on CircleCI with Windows executors.

## Setup Instructions

1. **Sign up for CircleCI**:
   - Go to [CircleCI](https://circleci.com/) and sign up/log in with your GitHub account
   - Add the KeepKey Desktop repository to CircleCI

2. **Configure Environment Variables**:
   - In CircleCI project settings, add the following environment variables:
     - `GITHUB_TOKEN`: GitHub token with repo permissions (for publishing releases)
     - Any code signing credentials if you plan to sign the Windows builds

3. **Understanding the Build Process**:

   The Windows build process in CircleCI:
   
   - Uses the Windows executor from CircleCI
   - Sets up Node.js using NVS (Node Version Switcher)
   - Configures Yarn Berry for package management
   - Installs necessary Windows build dependencies (Python, VS Build Tools)
   - Builds and packages the Electron application
   - Stores artifacts for download or deployment

## Common Issues and Solutions

### Long Paths Issues
Windows has path length limitations that can cause issues with Node.js projects:
- The configuration sets `git config --global core.longpaths true` to help with this
- Keep nested folder structures to a minimum

### Native Module Builds
Electron apps with native modules require proper build tools:
- VS Build Tools 2022 is installed in the config
- Python 3 is installed for node-gyp
- `npm config set msvs_version 2022` is set to ensure node-gyp uses the correct build tools

### Node.js Version Management
- NVS is used instead of nvm-windows for better compatibility with CI
- The `.nvmrc` file in the repository root defines the Node.js version

## Extending the Configuration

To add additional steps or modify the existing workflow:

1. Edit the `.circleci/config.yml` file
2. Add new jobs or modify existing ones as needed
3. Update the workflow definition to include your changes

## Resources

- [CircleCI Windows Executor Documentation](https://circleci.com/docs/using-windows/)
- [CircleCI Windows Orb](https://circleci.com/developer/orbs/orb/circleci/windows)
- [Electron Builder Documentation](https://www.electron.build/) 