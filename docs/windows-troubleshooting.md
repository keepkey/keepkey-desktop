# KeepKey Desktop Windows Troubleshooting Guide

This document provides solutions to common issues encountered when building and running KeepKey Desktop on Windows.

## Native Module Build Issues

### node-hid Build Failures

**Symptoms:**
- Error message: `gyp ERR! build error` when building node-hid
- Error about missing Python or Visual Studio

**Solutions:**

1. **Ensure correct Visual Studio Build Tools are installed:**
   ```powershell
   # Check if VC++ tools are installed
   dir "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC" /b
   
   # If missing, reinstall with proper workload
   winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"
   ```

2. **Verify Python is accessible and properly configured:**
   ```powershell
   # Check Python version
   python --version
   
   # Configure npm to use specific Python path
   npm config set python "C:\Path\To\Python312\python.exe" -g
   ```

3. **Try setting environment variables directly:**
   ```powershell
   $env:PYTHON = "C:\Path\To\Python312\python.exe"
   $env:npm_config_msvs_version = "2022"
   yarn
   ```

4. **Try the pre-built binaries flag:**
   ```powershell
   $env:npm_config_node_hid_no_compile = "true"
   yarn
   ```

### usb Module Build Failures

**Symptoms:**
- Error messages related to `usb` or `libusb` compilation
- `Cannot find module 'usb'` errors

**Solutions:**

1. **Use node-modules linking mode:**
   ```powershell
   yarn config set nodeLinker node-modules
   rm -r node_modules
   yarn
   ```

2. **For existing projects, try rebuilding specifically:**
   ```powershell
   yarn rebuild usb
   ```

3. **Check USB device connectivity:**
   ```powershell
   # Check device manager for USB devices
   Start-Process devmgmt.msc
   ```

### Path Length Errors

**Symptoms:**
- Error messages about paths being too long
- Unexpected truncation of file paths

**Solutions:**

1. **Enable long paths in Git:**
   ```powershell
   git config --global core.longpaths true
   ```

2. **Enable Windows 10/11 long path support:**
   ```powershell
   # Run in an admin PowerShell
   Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -Type DWord
   ```

3. **Move project to a shorter path:**
   - Move from `C:\Users\username\Documents\GitHub\...` to something like `C:\Dev\...`

4. **Use junctions for deeply nested directories:**
   ```powershell
   # Create junction (admin PowerShell)
   mklink /J C:\short_path C:\Users\username\very\long\path\to\directory
   ```

## Runtime Issues

### Electron Launch Failures

**Symptoms:**
- Electron app crashes immediately after launch
- Blank/white screen on startup

**Solutions:**

1. **Check application logs:**
   ```powershell
   # View recent logs
   Get-Content "$env:APPDATA\keepkey-desktop\logs\main.log" -Tail 50
   ```

2. **Try running with debugging enabled:**
   ```powershell
   # Set environment variable to show DevTools on startup
   $env:ELECTRON_ENABLE_LOGGING = "true"
   $env:ELECTRON_ENABLE_STACK_DUMPING = "true"
   yarn dev
   ```

3. **Check for firewall/antivirus interference:**
   - Temporarily disable antivirus or firewall to check if they're blocking Electron
   - Add exclusions for the KeepKey Desktop executable

### USB Device Detection Issues

**Symptoms:**
- KeepKey device not detected by the application
- "No device found" or similar error

**Solutions:**

1. **Check device in Windows Device Manager:**
   ```powershell
   Start-Process devmgmt.msc
   ```
   - Look for "KeepKey" or "Unknown Device" under "Universal Serial Bus devices"

2. **Check USB permissions:**
   ```powershell
   # Install WinUSB tools
   winget install -e --id Zadig.Zadig
   ```
   - Use Zadig to install correct WinUSB drivers for the KeepKey device

3. **Try different USB port:**
   - USB 3.0 ports (blue) sometimes have issues with certain devices
   - Try a USB 2.0 port (black) if available

4. **Restart USB subsystem:**
   ```powershell
   # Admin PowerShell
   Stop-Service -Name "usbstor" -Force
   Start-Service -Name "usbstor"
   ```

### File Watching Issues

**Symptoms:**
- Hot reload not working during development
- ENOENT or EPERM errors related to file watching

**Solutions:**

1. **Increase file watching limit:**
   - Edit the project's webpack configuration to use polling

2. **Add Windows Defender exclusions:**
   - Add your project directory to Windows Defender exclusions

3. **Check file locks:**
   ```powershell
   # Install handle tool from Sysinternals
   winget install -e --id Microsoft.Sysinternals.Handle
   
   # Check which process has files locked
   handle.exe -a [path to your project]
   ```

## Electron Builder Issues

### Signing Failures

**Symptoms:**
- Error messages about code signing during build
- Windows SmartScreen warnings on the built app

**Solutions:**

1. **Check certificate installation:**
   ```powershell
   # View certificates
   certmgr.msc
   ```

2. **Configure electron-builder for proper signing:**
   ```json
   // In package.json
   "build": {
     "win": {
       "certificateFile": "./path/to/certificate.pfx",
       "certificatePassword": "env:CERTIFICATE_PASSWORD",
       "signingHashAlgorithms": ["sha256"]
     }
   }
   ```

3. **Use environment variables for passwords:**
   ```powershell
   $env:CERTIFICATE_PASSWORD = "your-password-here"
   yarn release
   ```

### Installer Creation Issues

**Symptoms:**
- electron-builder fails to create installers
- Error messages about NSIS or other packaging tools

**Solutions:**

1. **Install required dependencies:**
   ```powershell
   # Make sure NSIS is installed
   winget install -e --id NSIS.NSIS
   ```

2. **Clean build directories before rebuilding:**
   ```powershell
   yarn clean
   yarn build
   yarn release
   ```

3. **Check for antivirus interference:**
   - Temporarily disable antivirus or add exclusions for build directories

## Windows Update and Node.js Version Conflicts

**Symptoms:**
- Previously working builds suddenly failing after Windows Update
- Node.js or npm errors after updates

**Solutions:**

1. **Check and update Node.js:**
   ```powershell
   # If using NVS
   nvs upgrade lts
   nvs link lts
   
   # Verify version
   node --version
   ```

2. **Rebuild node-gyp after Windows updates:**
   ```powershell
   npm rebuild
   ```

3. **Reinstall build tools if necessary:**
   ```powershell
   # Repair Visual Studio Build Tools
   winget upgrade -e --id Microsoft.VisualStudio.2022.BuildTools
   ```

## Windows Defender False Positives

**Symptoms:**
- Unexpected deletion of built files
- KeepKey Desktop flagged as suspicious by Windows Defender

**Solutions:**

1. **Add exclusions for the entire project:**
   - Open Windows Security > Virus & threat protection > Manage settings
   - Add exclusions for:
     - The KeepKey Desktop source directory
     - The build output directory
     - Yarn cache directory

2. **Create exclusions for executable:**
   ```powershell
   # Add exclusion for the exe
   Add-MpPreference -ExclusionPath "C:\path\to\build\KeepKey-Desktop-Setup.exe"
   ```

3. **Submit false positive report to Microsoft:**
   - Upload the flagged file to Microsoft for analysis at [Microsoft Security Intelligence](https://www.microsoft.com/wdsi/filesubmission)

## Performance Issues

**Symptoms:**
- Slow builds on Windows compared to other platforms
- High CPU/memory usage during development

**Solutions:**

1. **Increase Node.js memory limit:**
   ```powershell
   # Set higher memory limit
   $env:NODE_OPTIONS = "--max-old-space-size=4096"
   ```

2. **Use RAM disk for temporary files:**
   ```powershell
   # Install ImDisk
   winget install -e --id LTR.ImDisk
   
   # Create RAM disk (admin PowerShell)
   imdisk -a -s 2G -m R: -p "/fs:ntfs /q /y"
   
   # Set temp directory
   $env:TEMP = "R:\Temp"
   $env:TMP = "R:\Temp"
   ```

3. **Disable Windows Search indexing for development directories:**
   - Open Indexing Options from Control Panel
   - Click Modify and remove your development directories

## Resources and Further Help

- [Electron Windows Guide](https://www.electronjs.org/docs/latest/development/build-instructions-windows)
- [Node.js on Windows Documentation](https://nodejs.org/en/download/package-manager#windows-1)
- [electron-builder Troubleshooting](https://www.electron.build/configuration/win) 