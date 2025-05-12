# Windows Environment Setup for KeepKey Desktop

This guide provides step-by-step instructions for setting up a complete development environment for KeepKey Desktop on Windows, with a focus on avoiding common pitfalls and ensuring native dependencies build correctly.

## Initial Setup

### 1. Prepare Windows

Before you begin, ensure your Windows installation is up-to-date:

```powershell
# Run Windows Update
Start-Process ms-settings:windowsupdate
```

### 2. Install PowerShell 7

PowerShell 7 provides significant improvements over the built-in PowerShell:

```powershell
# Install PowerShell 7 using winget
winget install --id Microsoft.PowerShell
```

After installation, open a new PowerShell 7 terminal window for all subsequent commands.

### 3. Configure PowerShell Execution Policy

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Development Tools Installation

### 1. Git Setup

```powershell
# Install Git
winget install --id Git.Git

# Configure Git for Windows
git config --global core.longpaths true
git config --global core.autocrlf input
git config --global core.editor "notepad"
git config --global core.pager ""
git config --global pull.rebase false
git config --global init.defaultBranch main
```

### 2. Node.js Setup

```powershell
# Install Node Version Switcher (NVS)
git clone https://github.com/jasongin/nvs "$env:USERPROFILE\nvs"
. "$env:USERPROFILE\nvs\nvs.ps1" install

# Set up NVS in profile
Add-Content $PROFILE @"
# NVS
. "$env:USERPROFILE\nvs\nvs.ps1"
"@

# Install Node.js LTS
nvs add lts
nvs link lts
```

### 3. Essential Build Tools

```powershell
# Install Visual Studio Build Tools (takes ~10-15 minutes)
winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"

# Install Python 3.12
winget install -e --id Python.Python.3.12

# Add Python to PATH
$pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $pythonPath) {
    $pythonPath = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
}
```

### 4. Configure Node.js Build Environment

```powershell
# Configure npm to use correct Visual Studio and Python versions
npm config set msvs_version 2022 -g
npm config set python "$pythonPath" -g

# Create and configure Yarn cache folder
$yarnCacheFolder = "$env:LOCALAPPDATA\YarnCache"
if (-not (Test-Path $yarnCacheFolder)) {
    New-Item -Path $yarnCacheFolder -ItemType Directory | Out-Null
}
setx YARN_CACHE_FOLDER $yarnCacheFolder

# Skip large downloads
setx PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
setx ELECTRON_SKIP_BINARY_DOWNLOAD 1
```

### 5. Windows Terminal Setup

```powershell
# Install Windows Terminal
winget install -e --id Microsoft.WindowsTerminal
```

After installation, configure profiles for:
- PowerShell 7 (for admin tasks)
- Git Bash (for scripts that expect Unix paths)
- WSL 2 (optional, for Linux tooling)

## KeepKey Desktop Project Setup

### 1. Clone the Repository

```powershell
# Create a development folder (use a short path)
mkdir "$env:USERPROFILE\Dev"
cd "$env:USERPROFILE\Dev"

# Clone the repository
git clone https://github.com/keepkey/keepkey-desktop.git
cd keepkey-desktop
```

### 2. Configure Yarn

```powershell
# Install Yarn if not already installed
npm install -g yarn

# Set Yarn version
yarn set version stable

# Configure nodeLinker to node-modules mode (crucial for native modules)
yarn config set nodeLinker node-modules
```

### 3. Install Dependencies

```powershell
# Set environment variables for successful build
$env:PYTHON = "$pythonPath"
$env:npm_config_msvs_version = "2022"

# Install dependencies
yarn
```

## Windows Defender Configuration

To prevent Windows Defender from interfering with the build process:

1. Open Windows Security from Start menu
2. Navigate to "Virus & threat protection"
3. Under "Virus & threat protection settings", click "Manage settings"
4. Scroll down to "Exclusions" and click "Add or remove exclusions"
5. Add the following paths:
   - Your project directory (e.g., `C:\Users\username\Dev\keepkey-desktop`)
   - Yarn cache (`%LOCALAPPDATA%\YarnCache`)
   - Node modules directory (e.g., `C:\Users\username\Dev\keepkey-desktop\node_modules`)
   - Temp build directory (`%TEMP%`)

## Development Workflow

### 1. Starting the Development Server

```powershell
# Start development server
yarn dev
```

### 2. Building for Production

```powershell
# Build for production
yarn build

# Create installer
yarn release
```

### 3. Debugging Tips

- Use Electron DevTools: Open with Ctrl+Shift+I or View > Toggle Developer Tools
- Debug Node process: Start with `--inspect` flag
- Check logs: Located in `%APPDATA%\keepkey-desktop\logs`

## Troubleshooting Common Issues

### Native Module Build Failures

If you encounter build failures with native modules:

1. Check Visual Studio installation:
   ```powershell
   dir "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC" /b
   ```

2. Verify Python is accessible:
   ```powershell
   python --version
   ```

3. Clear yarn cache and node_modules:
   ```powershell
   rm -r node_modules
   yarn cache clean
   yarn
   ```

4. For node-hid specific issues:
   ```powershell
   $env:npm_config_node_hid_no_compile="true"
   yarn
   ```

### Path Length Issues

If you encounter "path too long" errors:

1. Ensure Git has longpaths enabled:
   ```powershell
   git config --global core.longpaths true
   ```

2. Move your project to a shorter path (e.g., `C:\Dev\` instead of deep in `Documents`)

3. Consider using junctions for deeply nested folders:
   ```powershell
   mklink /J shorter_path original_long_path
   ```

### Windows Specific Node.js Issues

1. For ENOENT errors on file watching:
   - Use `chokidar` with `usePolling: true`
   
2. For EPERM errors when building:
   - Close any applications that might have files open
   - Add the directory to Windows Defender exclusions

## Maintenance Practices

### Weekly Tasks

```powershell
# Update dependencies
yarn upgrade-interactive

# Clean up dependency graph
yarn dedupe --strategy highest

# Clean Yarn cache 
yarn cache clean
```

### Monthly Tasks

```powershell
# Update Node.js
nvs upgrade lts

# Update development tools
winget upgrade --all
```

## Additional Resources

- [Electron Windows Guide](https://www.electronjs.org/docs/latest/development/build-instructions-windows)
- [Node.js Native Modules](https://nodejs.org/api/addons.html)
- [Windows API for Electron](https://www.electronjs.org/docs/latest/api/windows-native-api)
- [electron-builder Windows Guide](https://www.electron.build/configuration/win) 