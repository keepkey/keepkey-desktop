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
    // webUsbAdapter recognizes a device even if it does not support webUsb
    const webUsbDevice = await webUsbAdapter.getDevice().catch(() => undefined)
    if (webUsbDevice) {
      // this line throws the error if the device does not support webUsb
      try {
        const webUsbWallet = await webUsbAdapter.pairRawDevice(webUsbDevice)
        if (webUsbWallet) return webUsbWallet
      } catch (e) {
        console.error('unable to pair webUsb device', e)
      }
    }
    const hidDevice = await hidAdapter.getDevice().catch(() => undefined)
    if (hidDevice) {
      const hidWallet = await hidAdapter.pairRawDevice(hidDevice)
      return hidWallet
    }
    return undefined
  })()

  if (!wallet) {
    return { wallet }
  }

  const transport = wallet.transport as unknown as {
    write(data: Uint8Array, debugLink?: boolean): Promise<void>
    read(debugLink?: boolean): Promise<Uint8Array>
  }
  const transportWrite = transport.write.bind(transport)
  const transportRead = transport.read.bind(transport)
  transport.read = async (debugLink?: boolean) => {
    const out = await transportRead(debugLink)
    console.log('readDevice:', Buffer.from(out).toString('hex'))
    return out
  }
  transport.write = async (data: Uint8Array, debugLink?: boolean) => {
    console.log('writeDevice:', Buffer.from(data).toString('hex'))
    return await transportWrite(data, debugLink)
  }

  // need to refetch features since bootloaderMode is being cached on windows
  const features = await (async () => {
    const freshFeatures = await wallet.getFeatures().catch(() => undefined)
    if (freshFeatures) return freshFeatures
    // this will trigger if bootloader is old and does not support getFeatures
    const staleFeatures = wallet.features!
    return staleFeatures
  })()
  console.log('WALLET FEATURES', features)
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
