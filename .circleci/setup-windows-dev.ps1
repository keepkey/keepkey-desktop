# Setup script for Windows development environment
# Run this as Administrator

# Enable execution of scripts
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force

# Install Chocolatey if not already installed
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    refreshenv
}

# Install Python 3 for node-gyp
Write-Host "Installing Python 3..."
choco install python3 -y
refreshenv

# Set Python path for node-gyp
$pythonPath = (Get-Command python).Path
Write-Host "Python path: $pythonPath"
$env:PYTHON = $pythonPath
[Environment]::SetEnvironmentVariable("PYTHON", $pythonPath, "User")

# Install Visual Studio Build Tools
Write-Host "Installing VS Build Tools 2022..."
choco install visualstudio2022buildtools -y --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
refreshenv

# Install Node.js LTS using NVS
Write-Host "Setting up NVS for Node.js version management..."
$env:NVS_HOME = "$env:LOCALAPPDATA\nvs"
if (-not (Test-Path $env:NVS_HOME)) {
    git clone https://github.com/jasongin/nvs "$env:NVS_HOME"
    . "$env:NVS_HOME\nvs.ps1" install
}

# Add NVS to the path permanently
if (-not (Test-Path "$env:NVS_HOME\nvs.ps1")) {
    Write-Host "NVS installation failed. Please check and try again."
    exit 1
}

# Configure node-gyp
Write-Host "Configuring node-gyp..."
npm config set msvs_version 2022 -g
npm install --global node-gyp

# Configure Git for long paths
Write-Host "Configuring Git for long paths..."
git config --global core.longpaths true

# Configure Yarn Berry
Write-Host "Setting up Yarn Berry..."
corepack enable
# Don't set version here as the project will do it

# Set up Yarn cache
$yarnCacheFolder = "$env:LOCALAPPDATA\YarnCache"
Write-Host "Setting YARN_CACHE_FOLDER to $yarnCacheFolder"
[Environment]::SetEnvironmentVariable("YARN_CACHE_FOLDER", $yarnCacheFolder, "User")

Write-Host "Setup completed successfully!"
Write-Host "IMPORTANT: You may need to restart your terminal or computer for all changes to take effect."
Write-Host "After restarting, navigate to the project directory and run 'yarn install' to set up the project." 