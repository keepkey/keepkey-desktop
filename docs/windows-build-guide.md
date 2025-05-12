# KeepKey Desktop Windows Build Guide

This guide provides instructions for building and developing KeepKey Desktop on Windows. Following these best practices will help avoid common issues with native dependencies and environment setup.

## Prerequisites

### Required Software

- **Node.js**: Use LTS version (v20.x as of 2025)
  - Avoid using system installer. Instead, use a version manager like `nvs` or `volta`
  - Keep a separate bleeding-edge Node in WSL 2 for experiments
  - Keep Windows host on strictly LTS versions
  
- **Visual Studio Build Tools 2022**
  - Required for native module compilation
  - Must include "Desktop development with C++" workload

- **Python 3.12+**
  - Required for node-gyp and native module builds

- **Git**
  - Configure with proper line ending handling
  - Set `core.longpaths true` to avoid Windows path length limitations

- **Windows Terminal**
  - Create separate profiles for PowerShell 7, Git Bash, and WSL 2

## Environment Setup

### 1. Install Tools

```powershell
# Install Visual Studio Build Tools
winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"

# Install Python
winget install -e --id Python.Python.3.12

# Configure PowerShell execution policy
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Install Git with long path support
git config --global core.longpaths true
```

### 2. Configure Node.js Environment

```powershell
# Configure npm to use correct VS and Python versions
npm config set msvs_version 2022 -g
npm config set python "C:\Path\To\Python312\python.exe" -g

# Set Yarn cache folder to avoid large path issues
$env:YARN_CACHE_FOLDER = "$env:LOCALAPPDATA\YarnCache"
setx YARN_CACHE_FOLDER "$env:LOCALAPPDATA\YarnCache"

# Skip Chromium download to avoid large downloads
setx PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
setx ELECTRON_SKIP_BINARY_DOWNLOAD 1
```

### 3. Configure Git

```powershell
# Configure git to use notepad for editor (avoid vim)
git config --global core.editor "notepad"

# Disable pager to avoid getting stuck in less
git config --global core.pager ""

# Configure line endings
git config --global core.autocrlf input
```

## Project Setup

### 1. Clone Repository

```powershell
git clone https://github.com/keepkey/keepkey-desktop.git
cd keepkey-desktop
```

### 2. Yarn Configuration

```powershell
# Set yarn version
yarn set version stable

# Configure nodeLinker to node-modules mode
yarn config set nodeLinker node-modules
```

### 3. Install Dependencies

```powershell
yarn
```

If you encounter issues with native modules, try:

```powershell
# Set environment variables for native module builds
$env:PYTHON = "C:\Path\To\Python312\python.exe"
$env:npm_config_msvs_version = "2022"
yarn
```

## Common Issues and Solutions

### Native Module Build Failures

- **`node-hid` fails to build**: Ensure Visual Studio Build Tools are installed and properly configured
- **Python-related errors**: Ensure Python 3.12+ is installed and the path is correctly set
- **Path length errors**: Use `git config --global core.longpaths true` and keep project in a short path

### Windows Defender Interference

Configure Defender controlled-folder-access exceptions for Node's temp build dirs to prevent false ransomware hits:

1. Open Windows Security
2. Go to Virus & threat protection
3. Click "Manage Ransomware Protection"
4. Click "Allow an app through Controlled folder access"
5. Add Node.js and build directories

### Electron Issues

- **Blurry windows on multi-DPI setups**: Run Electron with `--enable-features=TurnOffStreamlinedResize`
- **Auto-update failures**: Don't run Electron as Administrator
- **Signing issues**: Sign Electron executables with EV certificate + SHA-256 to avoid SmartScreen warnings

## Development Best Practices

### File System and Paths

- Don't develop Electron apps under FAT32 or exFAT partitions—no symlink support
- Don't hard-code absolute C:\ paths; use `path.join(process.env.USERPROFILE, ...)`
- Don't rely on %TEMP% for long-lived data; it's cleared unpredictably by Windows Storage Sense

### Node.js and Dependencies

- Don't mix Yarn and npm in the same repo
- Don't install global packages with admin PowerShell
- Run `yarn dedupe --strategy highest` weekly to keep dependency graph trim
- Add `--max_old_space_size=4096` to heavy Node scripts when working on 16GB+ machines

### File Watching

- Don't assume fs.watch reliability on Windows; prefer chokidar with `usePolling: true` for hot reload
- Add Defender exclusions for your project directory to avoid slowdowns during file watching

### Windows Terminal Setup

- PowerShell 7 for admin tasks (choco, winget, signtool)
- Git Bash for scripts that expect Unix paths
- WSL 2 for Linux-only CLI (e.g., shell scripts)
- Use `code .` from the terminal to open code in context
- Always start the terminal in project root for proper context

## Building for Production

### Electron Builder

```powershell
# Build for production
yarn build
yarn release
```

### Package Configuration

Use electron-builder's nsis-web target to shrink installer size and enable graceful auto-updates:

```json
"build": {
  "win": {
    "target": [
      {
        "target": "nsis-web",
        "arch": ["x64"]
      }
    ]
  }
}
```

### Post-build and Testing

- Run production build before submitting PR
- Test auto-updates by installing a previous version
- Verify signatures and SmartScreen behavior
- Test on multiple Windows versions if possible

## Continuous Integration

Recommended CI setup for Windows builds:

1. Use GitHub Actions with windows-latest runner
2. Cache Yarn dependencies properly
3. Configure proper Node version using actions/setup-node
4. Install build tools and Python in CI
5. Use artifact caching to speed up builds

Example CI step to set up the build environment:

```yaml
- name: Setup Windows build environment
  run: |
    npm config set msvs_version 2022 -g
    npm config set python "%PYTHON_PATH%" -g
```

## Security Considerations

- Store secrets (API keys, cert passwords) in Windows Credential Manager—not .env checked into repo
- Sign Electron executables with proper certificates
- Use contextBridge + preload scripts for security when calling Windows APIs from renderer
- Don't ship debug Electron builds (NODE_ENV=development)—performance tanks and DevTools open 