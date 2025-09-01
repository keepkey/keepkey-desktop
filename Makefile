# KeepKey Desktop Release Makefile
# Local release process without CI/CD

# Variables
VERSION := $(shell node -p "require('./packages/keepkey-desktop/package.json').version")
RELEASE_BRANCH := release-$(VERSION)
APP_NAME := KeepKey Desktop
BUILD_DIR := packages/keepkey-desktop/dist
DMG_PATH := $(BUILD_DIR)/KeepKey*.dmg
ZIP_PATH := $(BUILD_DIR)/KeepKey*.zip
WINDOWS_PATH := $(BUILD_DIR)/KeepKey*.exe
LINUX_DEB_PATH := $(BUILD_DIR)/keepkey*.deb
LINUX_APPIMAGE_PATH := $(BUILD_DIR)/KeepKey*.AppImage

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

.PHONY: help version tag release build-mac sign-mac notarize upload-release clean

help:
	@echo "$(GREEN)KeepKey Desktop Release Process$(NC)"
	@echo ""
	@echo "Available targets:"
	@echo "  $(YELLOW)version$(NC)       - Display current version"
	@echo "  $(YELLOW)tag$(NC)           - Create and push git tag for current version"
	@echo "  $(YELLOW)release$(NC)       - Create GitHub release with gh cli"
	@echo "  $(YELLOW)build-mac$(NC)     - Build macOS release locally"
	@echo "  $(YELLOW)build-windows$(NC) - Build Windows release locally"
	@echo "  $(YELLOW)build-linux$(NC)   - Build Linux release locally"
	@echo "  $(YELLOW)sign-mac$(NC)      - Sign macOS build locally"
	@echo "  $(YELLOW)notarize$(NC)      - Notarize macOS build with Apple"
	@echo "  $(YELLOW)upload-release$(NC)- Upload built artifacts to GitHub release"
	@echo "  $(YELLOW)clean$(NC)         - Clean build artifacts"
	@echo ""
	@echo "$(GREEN)Full release workflow:$(NC)"
	@echo "  1. make tag"
	@echo "  2. make release"
	@echo "  3. make build-mac"
	@echo "  4. make sign-mac"
	@echo "  5. make notarize"
	@echo "  6. make upload-release"

version:
	@echo "Current version: $(GREEN)$(VERSION)$(NC)"
	@echo "Release branch: $(GREEN)$(RELEASE_BRANCH)$(NC)"

# Create and push git tag
tag:
	@echo "$(YELLOW)Creating tag v$(VERSION)...$(NC)"
	@if git rev-parse "v$(VERSION)" >/dev/null 2>&1; then \
		echo "$(RED)Tag v$(VERSION) already exists!$(NC)"; \
		exit 1; \
	fi
	@git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	@git push origin "v$(VERSION)"
	@echo "$(GREEN)Tag v$(VERSION) created and pushed!$(NC)"

# Create GitHub release
release:
	@echo "$(YELLOW)Creating GitHub release v$(VERSION)...$(NC)"
	@gh release create "v$(VERSION)" \
		--title "$(APP_NAME) v$(VERSION)" \
		--notes "Release v$(VERSION)" \
		--draft
	@echo "$(GREEN)Draft release created! Edit release notes on GitHub.$(NC)"

# Build macOS release
build-mac:
	@echo "$(YELLOW)Building macOS release...$(NC)"
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	@yarn install
	@echo "$(YELLOW)Building application...$(NC)"
	@yarn run build
	@echo "$(YELLOW)Creating macOS packages...$(NC)"
	@cd packages/keepkey-desktop && yarn run release
	@echo "$(GREEN)macOS build complete!$(NC)"

# Build Windows release
build-windows:
	@echo "$(YELLOW)Building Windows release...$(NC)"
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	@yarn install
	@echo "$(YELLOW)Building application...$(NC)"
	@yarn run build
	@echo "$(YELLOW)Creating Windows packages...$(NC)"
	@cd packages/keepkey-desktop && yarn electron-builder --win
	@echo "$(GREEN)Windows build complete!$(NC)"

# Build Linux release
build-linux:
	@echo "$(YELLOW)Building Linux release...$(NC)"
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	@yarn install
	@echo "$(YELLOW)Building application...$(NC)"
	@yarn run build
	@echo "$(YELLOW)Creating Linux packages...$(NC)"
	@cd packages/keepkey-desktop && yarn electron-builder --linux
	@echo "$(GREEN)Linux build complete!$(NC)"

# Sign macOS build locally
sign-mac:
	@echo "$(YELLOW)Signing macOS build...$(NC)"
	@if [ -z "$(APPLE_ID)" ]; then \
		echo "$(RED)Error: APPLE_ID environment variable not set!$(NC)"; \
		echo "Export it with: export APPLE_ID=your-apple-id"; \
		exit 1; \
	fi
	@if [ -z "$(APPLE_APP_SPECIFIC_PASSWORD)" ]; then \
		echo "$(RED)Error: APPLE_APP_SPECIFIC_PASSWORD environment variable not set!$(NC)"; \
		echo "Export it with: export APPLE_APP_SPECIFIC_PASSWORD=your-app-password"; \
		exit 1; \
	fi
	@echo "$(GREEN)Environment variables set, signing will occur during build process.$(NC)"

# Notarize macOS build
notarize:
	@echo "$(YELLOW)Notarizing macOS build...$(NC)"
	@if [ -z "$(APPLE_ID)" ] || [ -z "$(APPLE_APP_SPECIFIC_PASSWORD)" ]; then \
		echo "$(RED)Error: Apple credentials not set!$(NC)"; \
		echo "Set APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD environment variables"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Notarization will run automatically via afterSign.js during build$(NC)"
	@echo "$(GREEN)To manually notarize, use: xcrun notarytool submit [dmg-file] --apple-id $(APPLE_ID) --team-id DR57X8Z394$(NC)"

# Upload built artifacts to GitHub release
upload-release:
	@echo "$(YELLOW)Uploading release artifacts to GitHub...$(NC)"
	@echo "$(YELLOW)Uploading macOS artifacts...$(NC)"
	@if ls $(DMG_PATH) 1> /dev/null 2>&1; then \
		gh release upload "v$(VERSION)" $(DMG_PATH) --clobber; \
		echo "$(GREEN)DMG uploaded$(NC)"; \
	else \
		echo "$(YELLOW)No DMG found$(NC)"; \
	fi
	@if ls $(ZIP_PATH) 1> /dev/null 2>&1; then \
		gh release upload "v$(VERSION)" $(ZIP_PATH) --clobber; \
		echo "$(GREEN)ZIP uploaded$(NC)"; \
	else \
		echo "$(YELLOW)No ZIP found$(NC)"; \
	fi
	@echo "$(YELLOW)Uploading Windows artifacts...$(NC)"
	@if ls $(WINDOWS_PATH) 1> /dev/null 2>&1; then \
		gh release upload "v$(VERSION)" $(WINDOWS_PATH) --clobber; \
		echo "$(GREEN)Windows installer uploaded$(NC)"; \
	else \
		echo "$(YELLOW)No Windows installer found$(NC)"; \
	fi
	@echo "$(YELLOW)Uploading Linux artifacts...$(NC)"
	@if ls $(LINUX_DEB_PATH) 1> /dev/null 2>&1; then \
		gh release upload "v$(VERSION)" $(LINUX_DEB_PATH) --clobber; \
		echo "$(GREEN)DEB package uploaded$(NC)"; \
	else \
		echo "$(YELLOW)No DEB package found$(NC)"; \
	fi
	@if ls $(LINUX_APPIMAGE_PATH) 1> /dev/null 2>&1; then \
		gh release upload "v$(VERSION)" $(LINUX_APPIMAGE_PATH) --clobber; \
		echo "$(GREEN)AppImage uploaded$(NC)"; \
	else \
		echo "$(YELLOW)No AppImage found$(NC)"; \
	fi
	@echo "$(GREEN)All artifacts uploaded!$(NC)"

# Full macOS release (build, sign, notarize)
release-mac: sign-mac build-mac
	@echo "$(GREEN)macOS release build complete with signing and notarization!$(NC)"

# Clean build artifacts
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	@yarn clean
	@echo "$(GREEN)Clean complete!$(NC)"

# Update version in package.json files
bump-version:
	@echo "$(YELLOW)Current version: $(VERSION)$(NC)"
	@read -p "Enter new version: " NEW_VERSION; \
	node -e "const fs = require('fs'); \
		const pkg = require('./packages/keepkey-desktop/package.json'); \
		pkg.version = '$$NEW_VERSION'; \
		fs.writeFileSync('./packages/keepkey-desktop/package.json', JSON.stringify(pkg, null, 4));"
	@echo "$(GREEN)Version bumped to $$NEW_VERSION$(NC)"
	@echo "$(YELLOW)Don't forget to commit the version change!$(NC)"

# Publish release (remove draft status)
publish-release:
	@echo "$(YELLOW)Publishing release v$(VERSION)...$(NC)"
	@gh release edit "v$(VERSION)" --draft=false
	@echo "$(GREEN)Release v$(VERSION) is now published!$(NC)"

# Complete release workflow
full-release: tag release release-mac upload-release publish-release
	@echo "$(GREEN)Full release v$(VERSION) complete!$(NC)"