import { Body, Controller, Post, Security, Route, Tags, Response } from 'tsoa';
import { lastKnownKeepkeyState } from '../';
import wait from 'wait-promise'
import { ResetDevice, LoadDevice, ETHSignedTx } from '@shapeshiftoss/hdwallet-core'
import { checkKeepKeyUnlocked } from '../../utils';

export type policy = {
    policyName?: string,
    enabled?: boolean,
}

@Tags('Developer Endpoints')
@Route('')
export class FDeveloperController extends Controller {

    private sleep = wait.sleep;

    @Post('/loadDevice')
    @Security("api_key")
    @Response(500, "Internal server error")
    public async loadDevice(@Body() body: LoadDevice): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.loadDevice(body).then(resolve)
        })
    }

    @Post('/removePin')
    @Security("api_key")
    @Response(500, "Internal server error")
    public async removePin(): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()
            lastKnownKeepkeyState.wallet.removePin().then(resolve)
        })
    }

    @Post('/softReset')
    @Security("api_key")
    @Response(500, "Internal server error")
    public async softReset(@Body() body: void): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.softReset().then(resolve)
        })
    }

    @Post('/clearSession')
    @Security("api_key")
    @Response(500, "Internal server error")
    public async clearSession(@Body() body: void): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.clearSession().then(resolve)
        })
    }

    @Post('/reset')
    @Security("api_key")
    @Response(500, "Internal server error")
    public async reset(@Body() body: ResetDevice): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.softReset().then(resolve)
        })
    }

    @Post('/wipe')
    @Security("api_key")
    @Response(500, "Internal server error")
    public async wipe(@Body() body: void): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.wipe().then(resolve)
        })
    }

    @Post('/disconnect')
    @Security("api_key")
    @Response(500, "Internal server error")
    public async disconnect(@Body() body: void): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()
            lastKnownKeepkeyState.wallet.disconnect().then(resolve)
        })
    }

    @Post('/applyPolicy')
    @Security("api_key")
    @Response(500, "Internal server error")
    //TODO get policy type
    public async applyPolicy(@Body() body: any): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.applyPolicy(body).then(resolve)
        })
    }

    @Post('/applySettings')
    @Security("api_key")
    @Response(500, "Internal server error")
    //TODO get settings type
    public async applySettings(@Body() body: any): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.applySettings(body).then(resolve)
        })
    }

    @Post('/firmwareErase')
    @Security("api_key")
    @Response(500, "Internal server error")
    public async firmwareErase(@Body() body: void): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.firmwareErase().then(resolve)
        })
    }

    @Post('/firmwareUpload')
    @Security("api_key")
    @Response(500, "Internal server error")
    //TODO Firmware sent as buffer, express in types
    public async firmwareUpload(@Body() body: any): Promise<ETHSignedTx> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!lastKnownKeepkeyState.wallet) return reject()

            lastKnownKeepkeyState.wallet.firmwareUpload(body).then(resolve)
        })
    }

}
