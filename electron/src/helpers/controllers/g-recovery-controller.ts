import { Body, Controller, Post, Security, Route, Tags, Response, Middlewares } from 'tsoa';
import wait from 'wait-promise'
import { RecoverDevice, ETHSignedTx } from '@keepkey/hdwallet-core'
import { checkKeepKeyUnlocked } from '../utils'
import { kkStateController } from '../../globalState'
import { logger } from '../middlewares/logger';

interface Press {
    isYes: boolean;
}

interface SendPin {
    pin: string;
}

interface SendPassphrase {
    passphrase: string;
}

interface SendCharacterProto {
    character: string;
    _delete: boolean
    _done: boolean
}

@Tags('Recovery Endpoints')
@Route('')
export class GRecoveryController extends Controller {

    private sleep = wait.sleep;

    @Post('/recover')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async recover(@Body() body: RecoverDevice): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.recover(body).then(resolve)
        })
    }

    @Post('/pressYes')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async pressYes(@Body() body: void): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.pressYes().then(resolve)
        })
    }

    @Post('/pressNo')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async pressNo(@Body() body: void): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.pressNo().then(resolve)
        })
    }

    @Post('/press')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async press(@Body() body: Press ): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.pressNo().then(resolve)
        })
    }

    @Post('/sendPin')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async sendPin(@Body() body: SendPin ): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.sendPin(body.pin).then(resolve)
        })
    }

    @Post('/sendPassphrase')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async sendPassphrase(@Body() body: SendPassphrase ): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.sendPassphrase(body.passphrase).then(resolve)
        })
    }

    //change pin
    @Post('/changePin')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async changePin(@Body() body: void): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.changePin().then(resolve)
        })
    }

    @Post('/sendWord')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async sendWord(@Body() body: string): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.sendWord(body).then(resolve)
        })
    }

    @Post('/sendCharacter')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async sendCharacter(@Body() body: string): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.sendCharacter(body).then(resolve)
        })
    }

    @Post('/sendCharacterProto')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async sendCharacterProto(@Body() body: SendCharacterProto): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.sendCharacterProto(body.character,body._delete,body._done).then(resolve)
        })
    }

    @Post('/sendCharacterDelete')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async sendCharacterDelete(@Body() body: void): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.sendCharacterDelete().then(resolve)
        })
    }

    @Post('/sendCharacterDone')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async sendCharacterDone(@Body() body: void): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.sendCharacterDone().then(resolve)
        })
    }

    @Post('/decryptKeyValue')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async decryptKeyValue(@Body() body: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.decryptKeyValue(body.v).then(resolve)
        })
    }

    @Post('/cipherKeyValue')
    @Security("api_key")
    @Middlewares([logger])
    @Response(500, "Internal server error")
    public async cipherKeyValue(@Body() body: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            await checkKeepKeyUnlocked()
            if (!kkStateController.wallet) return reject()

            kkStateController.wallet.cipherKeyValue(body.v).then(resolve)
        })
    }

}
