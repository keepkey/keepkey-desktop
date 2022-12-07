import type { KeepKeyHDWallet, TransportDelegate } from '@shapeshiftoss/hdwallet-keepkey'
import type { Device } from '@shapeshiftoss/hdwallet-keepkey-nodewebusb'
import type { Features } from '@keepkey/device-protocol/lib/messages_pb'

export type GenericError = {
  prompt?: string
  success: boolean
  error?: string
}

export type FirmwareAndBootloaderData = {
  firmware: {
    version: string
    url: string
    hash: string
  }
  bootloader: {
    version: string
    url: string
    hash: string
  }
}

export type FirmwareAndBootloaderHashes = {
  bootloader: { [key: string]: string }[]
  firmware: { [key: string]: string }[]
}

export type AllFirmwareAndBootloaderData = {
  latest: FirmwareAndBootloaderData
  beta: FirmwareAndBootloaderData
  hashes: FirmwareAndBootloaderHashes
}

export type WebusbWallet = DeviceFeatures & {
  wallet: KeepKeyHDWallet
  device: Device
  transport: TransportDelegate
}

export type BasicWallet = GenericError & DeviceFeatures

export type DeviceFeatures = {
  bootloaderMode?: boolean
  bootloaderVersion: string | undefined
  firmwareVersion: string
  features?: Features.AsObject
}
