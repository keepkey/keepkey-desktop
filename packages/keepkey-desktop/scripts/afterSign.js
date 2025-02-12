require('dotenv').config();
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;

  console.log('Starting notarization process...');
  console.log('Environment Variables:');
  console.log('APPLE_ID:', process.env.APPLE_ID ? 'present' : 'missing');
  console.log('APPLE_APP_SPECIFIC_PASSWORD:', process.env.APPLE_APP_SPECIFIC_PASSWORD ? 'present' : 'missing');

  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD) {
    console.log('Skipping notarizing, since secrets are not present in env.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log('App Name:', appName);
  console.log('App Path:', appPath);
  console.log('Current Working Directory:', __dirname);

  try {
    await notarize({
      appBundleId: 'com.keepkey.desktop',
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      tool: 'notarytool',
      teamId: 'DR57X8Z394',
    });
    console.log('Notarization successful');
  } catch (error) {
    console.error('Error during notarization:', error);
  }
};
