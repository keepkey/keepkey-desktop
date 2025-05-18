# GitHub Actions Local Testing Guide

## Overview
This guide documents how to test GitHub Actions workflows locally using Act, addressing common issues faced in our KeepKey Desktop project. Local testing prevents the need for repetitive commits to debug workflow issues.

## Setup

### Installation

```bash
# macOS
brew install act

# Linux
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows with Chocolatey
choco install act-cli
```

### Configuration

Create an `.actrc` file in your project root:

```
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--secret-file=.secrets
```

Create a `.secrets` file for your GitHub token and other secrets:

```
GITHUB_TOKEN=your_personal_access_token
```

**Note:** Add `.secrets` and `.actrc` to your `.gitignore` to avoid committing sensitive information.

## Running Workflows Locally

### Basic Commands

```bash
# List available workflows
act -l

# Run a specific job in test mode
act -j test --container-architecture linux/amd64 -p=false

# Dry-run a job (validates without executing)
act -j release -n --container-architecture linux/amd64
```

### Debugging Tips

1. **Platform Compatibility**
   - When running on M1/M2 Macs, use the `--container-architecture linux/amd64` flag
   - Example: `act -j release --container-architecture linux/amd64`

2. **Docker Issues**
   - Ensure Docker is running
   - Fix credential issues by modifying ~/.docker/config.json to use `{"credsStore":""}`

3. **Node.js Version**
   - Act will use the Node.js version specified in `.nvmrc`

## Common Issues and Solutions

1. **Docker Credential Errors**
   - Error: `docker-credential-desktop: executable file not found in $PATH`
   - Solution: Set empty credsStore in Docker config `echo '{"credsStore":""}' > ~/.docker/config.json`

2. **Permission Issues**
   - Error: Permission denied when running Docker commands
   - Solution: Ensure Docker is correctly installed and your user is in the docker group

3. **Unsupported Platforms**
   - Issue: Windows-specific jobs can't run on macOS or Linux
   - Note: This is an inherent limitation of Act; some jobs must be tested on GitHub directly

4. **Large Docker Images**
   - Issue: Downloading large Docker images takes time
   - Solution: Use the `-p=false` flag to skip pulling images if they already exist

5. **Yarn PnP Issues**
   - Issue: Can't find Yarn PnP files in the Docker container
   - Solution: Create simpler test workflows that avoid PnP dependencies, or use a custom Docker image with Yarn pre-installed

6. **Matrix Builds**
   - Issue: Act doesn't fully support matrix builds for multiple platforms
   - Solution: Test each platform individually by specifying the matrix values directly

## Creating Test Workflows

For easier local testing, create simplified versions of your workflows:

```yaml
name: Test Build Process

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'

      - name: Environment Info
        run: |
          node -v
          npm -v
          echo "GITHUB_WORKSPACE: $GITHUB_WORKSPACE"
          ls -la

      - name: Test Basic Script
        run: |
          echo "console.log('This is a test')" > test.js
          node test.js
```

This simplified workflow avoids complex dependencies like Yarn while still testing the build environment.

## Example Testing Workflow

This is a tested workflow for KeepKey Desktop:

```bash
# 1. Set up configuration
echo "-P ubuntu-latest=catthehacker/ubuntu:act-latest" > .actrc
echo "--secret-file=.secrets" >> .actrc
echo "GITHUB_TOKEN=your_token" > .secrets

# 2. Add to .gitignore
echo ".secrets" >> .gitignore
echo ".actrc" >> .gitignore

# 3. List available workflows
act -l

# 4. Run specific test job
act -j build --container-architecture linux/amd64 -p=false

# 5. Dry run release job
act -j release -n --container-architecture linux/amd64
```

## Resources

- [Act GitHub Repository](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 