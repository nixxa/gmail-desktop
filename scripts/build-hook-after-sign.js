const { process } = require('node:process')
const { notarize } = require('electron-notarize')

exports.default = (context) => {
  const {
    electronPlatformName,
    appOutDir,
    packager: {
      appInfo: { productFilename: appName, id: appBundleId }
    }
  } = context

  const { APPLE_ID, APPLE_ID_APP_PASSWORD, CSC_LINK } = process.env

  if (
    electronPlatformName !== 'darwin' ||
    // If `CSC_LINK` is not defined, the app hasn't been signed before by electron-builder.
    !CSC_LINK
  ) {
    return
  }

  if (!APPLE_ID || !APPLE_ID_APP_PASSWORD) {
    throw new Error('`APPLE_ID` or `APPLE_ID_APP_PASSWORD` is missing')
  }

  return notarize({
    appBundleId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: APPLE_ID,
    appleIdPassword: APPLE_ID_APP_PASSWORD
  })
}
