import { Controller, Get, Security, Route, Tags, Response, Middlewares } from 'tsoa';
import wait from 'wait-promise'
import { ETHSignedTx } from '@keepkey/hdwallet-core'
import { checkKeepKeyUnlocked } from '../utils'
import { kkStateController } from '../../globalState';
import { logger } from '../middlewares/logger';

@Tags('Device Info Endpoints')
@Route('')
export class HDeviceInfoController extends Controller {

    private sleep = wait.sleep;

    @Get('/getNumCoins')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async getNumCoins(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.getNumCoins().then(resolve)
        })
    }

    @Get('/getCoinTable')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async getCoinTable(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.getCoinTable().then(resolve)
        })
    }

    @Get('/getDeviceID')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async getDeviceID(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.getDeviceID().then(resolve)
        })
    }

    @Get('/getVendor')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async getVendor(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            resolve(kkStateController.wallet.getVendor())
        })
    }


    @Get('/getModel')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async getModel(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.getModel().then(resolve)
        })
    }

    @Get('/getFirmwareVersion')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async getFirmwareVersion(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.getFirmwareVersion().then(resolve)
        })
    }

    @Get('/getLabel')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async getLabel(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.getLabel().then(resolve)
        })
    }

    @Get('/isInitialized')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async isInitialized(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.isInitialized().then(resolve)
        })
    }

    @Get('/isLocked')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async isLocked(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.isLocked().then(resolve)
        })
    }

    @Get('/hasOnDevicePinEntry')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async hasOnDevicePinEntry(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            resolve(kkStateController.wallet.hasOnDevicePinEntry())
        })
    }

    @Get('/hasOnDevicePassphrase')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async hasOnDevicePassphrase(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            resolve(kkStateController.wallet.hasOnDevicePassphrase())
        })
    }

    @Get('/hasOnDeviceDisplay')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async hasOnDeviceDisplay(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            resolve(kkStateController.wallet.hasOnDeviceDisplay())
        })
    }

    @Get('/hasOnDeviceRecovery')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async hasOnDeviceRecovery(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            resolve(kkStateController.wallet.hasOnDeviceRecovery())
        })
    }
}
