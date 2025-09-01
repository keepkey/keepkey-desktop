# KeepKey Desktop Release Process

This document describes the local release process for KeepKey Desktop without CI/CD.

## Prerequisites

### Required Tools
- Node.js (v16 or higher)
- Yarn v4
- GitHub CLI (`gh`) - Install with `brew install gh`
- Xcode (for macOS builds)
- Apple Developer Account (for signing/notarization)

### Environment Setup

1. **Apple Credentials (for macOS signing/notarization)**:
   ```bash
   export APPLE_ID="your-apple-id@example.com"
   export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
   ```
   
   To generate an app-specific password:
   - Go to https://appleid.apple.com
   - Sign in and go to Security
   - Under App-Specific Passwords, click Generate Password
   - Name it "KeepKey Desktop Notarization"

2. **GitHub Authentication**:
   ```bash
   gh auth login
   ```

## Release Workflow

### Quick Release (All Platforms)

For a complete release with all platforms:

```bash
# 1. Update version if needed
make bump-version

# 2. Commit version changes
git add -A
git commit -m "chore: bump version to X.Y.Z"
git push

# 3. Full release workflow
make full-release
```

### Step-by-Step Release

#### 1. Version Management

Check current version:
```bash
make version
```

Update version (if needed):
```bash
make bump-version
# Enter new version when prompted
git add packages/keepkey-desktop/package.json
git commit -m "chore: bump version to X.Y.Z"
git push
```

#### 2. Create Git Tag

```bash
make tag
```

This will:
- Create an annotated tag `vX.Y.Z`
- Push the tag to GitHub

#### 3. Create GitHub Release

```bash
make release
```

This creates a draft release on GitHub. You can edit the release notes later.

#### 4. Build for Each Platform

##### macOS Build (with signing and notarization)

```bash
# Ensure Apple credentials are set
export APPLE_ID="your-apple-id@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"

# Build, sign, and notarize in one step
make release-mac
```

The build process will:
1. Build the application
2. Sign it with your Apple Developer certificate
3. Notarize it with Apple (via afterSign.js)
4. Create DMG and ZIP files in `packages/keepkey-desktop/dist/`

##### Windows Build

```bash
make build-windows
```

Creates:
- NSIS installer (.exe)
- MSI installer
Located in `packages/keepkey-desktop/dist/`

##### Linux Build

```bash
make build-linux
```

Creates:
- DEB package
- AppImage
Located in `packages/keepkey-desktop/dist/`

#### 5. Upload Artifacts to GitHub

After building all platforms:

```bash
make upload-release
```

This uploads all built artifacts to the GitHub release.

#### 6. Publish Release

Once you've verified the artifacts and updated release notes:

```bash
make publish-release
```

This removes the draft status and publishes the release.

## Platform-Specific Notes

### macOS Signing & Notarization

The signing and notarization process is automated through `afterSign.js` which runs during the build process.

**Manual Notarization** (if automatic fails):
```bash
# Submit for notarization
xcrun notarytool submit path/to/KeepKey.dmg \
  --apple-id $APPLE_ID \
  --password $APPLE_APP_SPECIFIC_PASSWORD \
  --team-id DR57X8Z394 \
  --wait

# Staple the notarization
xcrun stapler staple path/to/KeepKey.dmg
```

**Verify Notarization**:
```bash
# Check if app is notarized
spctl -a -vvv -t install path/to/KeepKey.app

# Check notarization status
xcrun stapler validate path/to/KeepKey.dmg
```

### Windows Code Signing

For Windows signing (optional):
1. Obtain a code signing certificate
2. Use SignTool (part of Windows SDK) or a service like DigiCert

### Linux Signing

Linux packages can be signed with GPG:
```bash
gpg --armor --detach-sign keepkey-desktop_X.Y.Z_amd64.deb
```

## Troubleshooting

### Common Issues

1. **Notarization fails with "Package Invalid"**
   - Ensure all binaries in the app are signed
   - Check that entitlements are correct
   - Verify hardened runtime is enabled

2. **Build fails with native module errors**
   - Run `yarn install` with `--force` flag
   - Rebuild native modules: `npx electron-rebuild`

3. **GitHub release upload fails**
   - Check `gh` authentication: `gh auth status`
   - Ensure release exists: `gh release list`
   - Use `--clobber` flag to overwrite existing artifacts

### Debugging

Enable verbose logging:
```bash
DEBUG=electron-builder,@electron/notarize yarn run release
```

Check build configuration:
```bash
cat packages/keepkey-desktop/package.json | jq .build
```

## Version History

Current version structure: `X.Y.Z`
- X: Major version (breaking changes)
- Y: Minor version (new features)
- Z: Patch version (bug fixes)

## Security Notes

1. **Never commit credentials** to the repository
2. **Use app-specific passwords** for Apple notarization
3. **Keep signing certificates secure** and use separate ones for production
4. **Verify all artifacts** before publishing releases

## Makefile Commands Reference

| Command | Description |
|---------|------------|
| `make help` | Show all available commands |
| `make version` | Display current version |
| `make tag` | Create and push git tag |
| `make release` | Create GitHub release |
| `make build-mac` | Build macOS release |
| `make build-windows` | Build Windows release |
| `make build-linux` | Build Linux release |
| `make sign-mac` | Verify signing credentials |
| `make notarize` | Info about notarization |
| `make upload-release` | Upload artifacts to GitHub |
| `make publish-release` | Publish the release |
| `make full-release` | Complete release workflow |
| `make clean` | Clean build artifacts |

## Support

For issues with the release process:
1. Check the [GitHub Issues](https://github.com/keepkey/keepkey-desktop/issues)
2. Contact the development team
3. Review build logs in `packages/keepkey-desktop/dist/`