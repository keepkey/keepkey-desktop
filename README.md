# KeepKey Desktop

An all-in-one suite for using your KeepKey hardware wallet.

## Build Status

[![CircleCI](https://circleci.com/gh/keepkey/keepkey-desktop.svg?style=shield)](https://circleci.com/gh/keepkey/keepkey-desktop)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/keepkey/keepkey-desktop/build-electron.yml?label=GitHub%20Actions)](https://github.com/keepkey/keepkey-desktop/actions/workflows/build-electron.yml)

## Development

### Prerequisites

#### Windows
- Node.js LTS (v20.x)
- Yarn Berry
- Visual Studio Build Tools 2022
- Python 3.x
- Git

Run the setup script to configure your Windows environment:
```powershell
# Run as Administrator
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\.circleci\setup-windows-dev.ps1
```

#### macOS/Linux
Refer to the GitHub Actions workflow for macOS/Linux setup instructions.

### Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/keepkey/keepkey-desktop.git
   cd keepkey-desktop
   ```

2. Install dependencies:
   ```
   yarn set version stable
   yarn install
   ```

3. Start the development environment:
   ```
   yarn dev
   ```

## Building

### Using Yarn

```bash
# Build the application
yarn build

# Package the application
yarn release
```

### CI/CD

This project uses both GitHub Actions and CircleCI for continuous integration:

- **GitHub Actions**: Builds macOS, Linux, and Windows packages
- **CircleCI**: Provides dedicated Windows builds (avoids Hyper-V requirements)

See the `.github/workflows/build-electron.yml` and `.circleci/config.yml` files for build configurations.

## Architecture

KeepKey Desktop is an Electron application with a modular structure:

- `packages/keepkey-desktop` - Main Electron application
- `packages/keepkey-desktop-app` - The UI application
- `packages/keepkey-sdk` - SDK for interacting with KeepKey devices
- `packages/keepkey-sdk-server` - REST API server for the SDK

## License

See the [LICENSE](LICENSE) file for details. 