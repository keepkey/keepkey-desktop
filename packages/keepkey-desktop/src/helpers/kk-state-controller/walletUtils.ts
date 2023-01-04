import type * as core from '@shapeshiftoss/hdwallet-core'
import { HIDKeepKeyAdapter } from '@shapeshiftoss/hdwallet-keepkey-nodehid'
import { NodeWebUSBKeepKeyAdapter } from '@shapeshiftoss/hdwallet-keepkey-nodewebusb'

export const initializeWallet = async (
  keyring: core.Keyring,
  bootloaderHashes: Record<string, string>,
) => {
  const webUsbAdapter = await NodeWebUSBKeepKeyAdapter.useKeyring(keyring)
  const hidAdapter = await HIDKeepKeyAdapter.useKeyring(keyring)

  const wallet = await (async () => {
    const webUsbDevice = await webUsbAdapter.getDevice()
    if (webUsbDevice) return webUsbAdapter.pairRawDevice(webUsbDevice)
    const hidDevice = await hidAdapter.getDevice()
    if (hidDevice) return hidAdapter.pairRawDevice(hidDevice)
    return undefined
  })()

  if (!wallet) {
    return { wallet }
  }

  // wallet.features will not be undefined because adapter.pairRawDevice() calls wallet.initialize() for us
  const features = wallet.features!
  const { majorVersion, minorVersion, patchVersion, bootloaderHash } = features
  const version = `v${majorVersion}.${minorVersion}.${patchVersion}`

  return {
    bootloaderMode: !!features.bootloaderMode,
    bootloaderVersion: features.bootloaderMode
      ? version
      : bootloaderHashes[
          (typeof bootloaderHash === 'string'
            ? Buffer.from(bootloaderHash, 'base64')
            : Buffer.from(bootloaderHash)
          ).toString('hex')
        ],
    firmwareVersion: features.bootloaderMode ? undefined : version,
    features,
    wallet,
  }
}
