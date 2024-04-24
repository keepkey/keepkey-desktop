require('dotenv').config()
const { notarize } = require('@electron/notarize')

// const isSet = value => value && value !== 'false'

// electron-build hook to be used in electron-build pipeline in the future
// ===========================================================================
// Note: for now we don't use this at the moment.
// Run ./notarize-cli.js instead
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') return
  // skip notarization if secrets are not present in env
  if (!process.env.APPLE_ID_PASSWORD || !process.env.APPLE_ID) {
    console.log('Skipping notarizing, since secrets are not present in env.')
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appPath = `${appOutDir}/mac-arm64/${appName}.app` // Correct the path based on actual output directory
  console.log('app path:', appPath)
  console.log('cwd', __dirname)
  return notarize({
    appBundleId: 'com.keepkey.desktop',
    appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    tool: 'notarytool',
    teamId: 'DR57X8Z394',
  })
}
