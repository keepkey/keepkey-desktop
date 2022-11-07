import { Keyring } from '@shapeshiftoss/hdwallet-core'
import { Device } from '@shapeshiftoss/hdwallet-keepkey-nodewebusb'
import { KeepKeyHDWallet, TransportDelegate } from '@shapeshiftoss/hdwallet-keepkey'
import { usb } from 'usb'
import { getLatestFirmwareData } from './firmwareUtils';
import { initializeWallet } from './walletUtils'
import { start_bridge, stop_bridge } from '..';

// possible states
export const REQUEST_BOOTLOADER_MODE = 'requestBootloaderMode'
export const UPDATE_BOOTLOADER = 'updateBootloader'
export const UPDATE_FIRMWARE = 'updateFirmware'
export const NEEDS_INITIALIZE = 'needsInitialize'
export const CONNECTED = 'connected'
export const HARDWARE_ERROR =  '@keepkey/hardwareError'


// temporarily using the same state as hardware error
export const DISCONNECTED =  '@keepkey/hardwareError'

/**
 * Keeps track of the last known state of the keepkey
 * sends ipc events to the web renderer on state change
 */
export class KKStateController {
    public keyring: Keyring
    public device?: Device
    public wallet?: KeepKeyHDWallet
    public transport?: TransportDelegate

    public lastState?: string
    public lastData?: any

    public onStateChange: any
    constructor(onStateChange: any) {
        this.keyring = new Keyring()
        this.onStateChange = onStateChange
        usb.on('attach', async () => {
            await this.syncState()
        })
        usb.on('detach', async () => {
            this.transport = undefined
            this.keyring = new Keyring()
            this.updateState(DISCONNECTED, { unplugged: true })
        })
    }

    updateState = async (newState: string, newData: any) => {
        // TODO event is a bad name, change it to data everywhere its used
        this.onStateChange(newState, { event: newData })
        this.lastState = newState
        this.lastData = newData
    }

    syncState = async () => {
        const latestFirmware = await getLatestFirmwareData()
        const resultInit = await initializeWallet(this)

        if(resultInit.unplugged)
            this.updateState(DISCONNECTED, { unplugged: true })
        else if (!resultInit || !resultInit.success || resultInit.error)
            this.updateState(HARDWARE_ERROR, { error: resultInit?.error })
        else if (resultInit.bootloaderVersion !== latestFirmware.bootloader.version)
            this.updateState(UPDATE_BOOTLOADER, {
                bootloaderUpdateNeeded: true,
                firmware: resultInit.firmwareVersion,
                bootloader: resultInit.bootloaderVersion,
                recommendedBootloader: latestFirmware.bootloader.version,
                recommendedFirmware: latestFirmware.firmware.version,
                bootloaderMode: resultInit.bootloaderMode
            })
        else if (resultInit.firmwareVersion !== latestFirmware.firmware.version) {
            this.updateState(UPDATE_FIRMWARE, {
                firmwareUpdateNeededNotBootloader: true,
                firmware: !!resultInit.firmwareVersion ? resultInit.firmwareVersion : 'v1.0.1',
                bootloader: resultInit.bootloaderVersion,
                recommendedBootloader: latestFirmware.bootloader.version,
                recommendedFirmware: latestFirmware.firmware.version,
                bootloaderMode: resultInit.bootloaderMode
            })
        } else if (!resultInit?.features?.initialized) {
            this.updateState(NEEDS_INITIALIZE, {
                needsInitialize: true
            })
        } else {
            this.updateState(CONNECTED, {
                ready: true
            })
        }
    }
    
}