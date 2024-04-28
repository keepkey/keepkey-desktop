import type { BTCInputScriptType } from '@keepkey/hdwallet-core'
import {
  Body,
  Middlewares,
  OperationId,
  Post,
  Produces,
  Response,
  Route,
  Security,
  Tags,
} from '@tsoa/runtime'
import { Readable } from 'stream'

import { ApiController } from '../../auth'
import { extra } from '../../middlewares'
import type * as types from '../../types'
let publicKeyCache = new Map<string, { xpub: string }>();

@Route('/system/info')
@Tags('Info')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class SystemInfoController extends ApiController {
  

  /**
   * Get entropy from the device's RNG.
   * @summary Get entropy
   */
  @Post('/get-entropy')
  @OperationId('GetEntropy')
  @Produces('application/octet-stream')
  public async getEntropy(@Body() body: { size: types.numeric.U32 }): Promise<Readable> {
    if (!this.context.wallet) throw undefined

    return Readable.from(await this.context.wallet.getEntropy(body.size))
  }

  /**
   * Get device features object
   * @summary Get features
   */
  @Post('/get-features')
  @OperationId('GetFeatures')
  public async getFeatures(): Promise<types.Features> {
    if (!this.context.wallet) throw undefined

    const features = await this.context.wallet.getFeatures()

    const bufferFromMaybeBase64 = (x: string | Uint8Array | undefined): Buffer | undefined => {
      if (x === undefined) return undefined
      if (typeof x === 'string') return Buffer.from(x, 'base64')
      return Buffer.from(x)
    }

    return {
      label: features.label,
      vendor: features.vendor,
      model: features.model,
      firmware_variant: features.firmwareVariant,
      device_id: features.deviceId,
      language: features.language,
      bootloader_mode: features.bootloaderMode ?? false,
      major_version: features.majorVersion,
      minor_version: features.minorVersion,
      patch_version: features.patchVersion,
      revision: bufferFromMaybeBase64(features.revision)?.toString('utf-8'),
      firmware_hash: bufferFromMaybeBase64(features.firmwareHash)?.toString('hex'),
      bootloader_hash: bufferFromMaybeBase64(features.bootloaderHash)?.toString('hex'),
      initialized: features.initialized,
      imported: features.imported,
      no_backup: features.noBackup,
      pin_protection: features.pinProtection,
      pin_cached: features.pinCached,
      passphrase_protection: features.passphraseProtection,
      passphrase_cached: features.passphraseCached,
      wipe_code_protection: features.wipeCodeProtection,
      auto_lock_delay_ms: features.autoLockDelayMs,
      policies: features.policiesList.map(x => ({
        policy_name: x.policyName!,
        enabled: x.enabled!,
      })),
    }
  }

  /**
   * Get public key associated with a particular BIP-32 node.
   * @summary Get public key
   */
  @Post('/get-public-key')
  @OperationId('GetPublicKey')
  public async getPublicKey(
    @Body()
    body: {
      address_n: types.AddressNList
      ecdsa_curve_name?: string
      show_display?: boolean
      coin_name?: string
      script_type?: 'p2pkh' | 'p2wpkh' | 'p2sh-p2wpkh'
    },
  ): Promise<{ xpub: string }> {
    if (!this.context.wallet) throw undefined
    const requestBodyKey = JSON.stringify(body);
    if (publicKeyCache.has(requestBodyKey)) {
      return publicKeyCache.get(requestBodyKey)!;
    }
    const [out] = await this.context.wallet.getPublicKeys([
      {
        addressNList: body.address_n,
        curve: body.ecdsa_curve_name ?? '',
        showDisplay: !!body.show_display,
        coin: body.coin_name ?? '',
        scriptType: (x => {
          switch (x) {
            case 'p2pkh':
              return x as BTCInputScriptType.SpendAddress
            case 'p2wpkh':
              return x as BTCInputScriptType.SpendWitness
            case 'p2sh-p2wpkh':
              return x as BTCInputScriptType.SpendP2SHWitness
            default:
              throw new Error('unrecognized script type')
          }
        })(body.script_type),
      },
    ])

    if (!out) throw new Error('expected public key, got null')
    // Store the result in the cache
    const result = { xpub: out.xpub };
    // Store the result in the cache
    publicKeyCache.set(requestBodyKey, result);
    return result;
  }

  /**
   * Dump device coins table.
   * @summary List coins
   */
  @Post('/list-coins')
  @OperationId('ListCoins')
  public async listCoins(): Promise<types.Coin[]> {
    if (!this.context.wallet) throw undefined

    const numCoins = await this.context.wallet.getNumCoins()
    // chunkSize should actually be pulled from the device, but hdwallet doesn't expose it for some reason
    const chunkSize = 24

    const coins = []
    for (let i = 0; i < numCoins; i += chunkSize) {
      coins.push(...(await this.context.wallet.getCoinTable(i, Math.min(numCoins, i + chunkSize))))
    }

    return coins
  }

  /**
   * Confirm device connectivity, optionally with on-device confirmation.
   * @summary Ping
   */
  @Post('/ping')
  @OperationId('Ping')
  public async ping(
    @Body()
    body: {
      button_protection?: boolean
      pin_protection?: boolean
      passphrase_protection?: boolean
      wipe_code_protection?: boolean
      message?: string
    },
  ): Promise<{ message: string }> {
    if (!this.context.wallet) throw undefined

    if (body.wipe_code_protection) throw new Error('wipe code protection not supported')

    return {
      message: (
        await this.context.wallet.ping({
          msg: body.message ?? '',
          button: body.button_protection,
          pin: body.pin_protection,
          passphrase: body.passphrase_protection,
        })
      ).msg,
    }
  }
}
