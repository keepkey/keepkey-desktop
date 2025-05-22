#!/usr/bin/env pwsh
# Windows Local Build Script for KeepKey Desktop
# Run this script to build Windows executables locally using Act

Write-Host "Starting KeepKey Desktop Windows Build..." -ForegroundColor Green
Write-Host ""

# Check if Act is installed
try {
    $actVersion = & act --version 2>$null
    Write-Host "Act is installed: $actVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Act is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Act first:" -ForegroundColor Yellow
    Write-Host "  winget install nektos.act" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    $dockerVersion = & docker --version 2>$null
    Write-Host "Docker is available: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Docker is not available" -ForegroundColor Red
    Write-Host "Please make sure Docker Desktop is installed and running" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Building Windows executable..." -ForegroundColor Cyan

# Run the Act workflow
& act -j windows-exe-build -W .github/workflows/local-windows-build.yml --container-architecture linux/amd64

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    if (Test-Path "windows-build-output") {
        Write-Host "Your Windows executables are in: .\windows-build-output\" -ForegroundColor Green
        Write-Host ""
        Write-Host "Files created:" -ForegroundColor Cyan
        Get-ChildItem "windows-build-output" | ForEach-Object {
            $size = if ($_.Length -gt 1MB) { 
                "{0:N1} MB" -f ($_.Length / 1MB) 
            } else { 
                "{0:N0} KB" -f ($_.Length / 1KB) 
            }
            Write-Host "  $($_.Name) ($size)" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "To test your build:" -ForegroundColor Yellow
        Write-Host "  .\windows-build-output\KeepKey-Desktop-*.exe" -ForegroundColor Yellow
    }
}
else {
    Write-Host ""
    Write-Host "Build failed. Check the output above for errors." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "  - Make sure Docker Desktop is running" -ForegroundColor Yellow
    Write-Host "  - Run: pnpm install" -ForegroundColor Yellow
    Write-Host "  - Check if .secrets file exists (copy from .secrets.example)" -ForegroundColor Yellow
}

Write-Host "" 