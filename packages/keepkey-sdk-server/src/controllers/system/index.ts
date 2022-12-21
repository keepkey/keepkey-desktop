import { Readable } from 'stream'
import {
  Body,
  Consumes,
  Deprecated,
  Middlewares,
  OperationId,
  Post,
  Produces,
  Query,
  Response,
  Route,
  Security,
  Tags,
} from 'tsoa'

import { ApiController } from '../../auth'
import { extra } from '../../middlewares'
import type * as types from '../../types'

export * from './debug'
export * from './info'
export * from './initialize'
export * from './manufacturing'

@Route('/system')
@Tags('System')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class SystemController extends ApiController {
  /**
   * Enable or disable certain device configuration values
   * @summary Apply policies
   */
  @Post('/apply-policies')
  @OperationId('ApplyPolicies')
  public async applyPolicies(@Body() body: types.Policy[]): Promise<void> {
    if (!this.context.wallet) throw undefined

    for (const policy of body) {
      await this.context.wallet.applyPolicy({
        policyName: policy.policy_name,
        enabled: policy.enabled,
      })
    }
  }

  /**
   * Change device configuration
   * @summary Apply settings
   */
  @Post('/apply-settings')
  @OperationId('ApplySettings')
  public async applySettings(
    @Body()
    body: /** @minProperties 1 */ {
      auto_lock_delay_ms?: types.numeric.U32
      label?: string
      language?: string
      use_passphrase?: boolean
      u2f_counter?: types.numeric.U32
    },
  ): Promise<void> {
    if (!this.context.wallet) throw undefined

    await this.context.wallet.applySettings({
      autoLockDelayMs: body.auto_lock_delay_ms,
      label: body.label,
      language: body.language,
      usePassphrase: body.use_passphrase,
      u2fCounter: body.u2f_counter,
    })
  }

  /**
   * @summary Change or remove the device's PIN
   */
  @Post('/change-pin')
  @OperationId('ChangePin')
  public async changePin(@Body() body: { remove?: boolean }): Promise<void> {
    if (!this.context.wallet) throw undefined

    if (body.remove) {
      await this.context.wallet.removePin()
    } else {
      await this.context.wallet.changePin()
    }
  }

  /**
   * @summary Change or remove the device's wipe code
   */
  @Post('/change-wipe-code')
  @OperationId('ChangeWipeCode')
  @Deprecated()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async changeWipeCode(@Body() _body: { remove?: boolean }): Promise<void> {
    throw new Error('changeWipeCode not supported')
  }

  /**
   * Encrypt or decrypt a key and associated block of data, possibly with an on-device verification step
   * @summary Encrypt or decrypt a key/value pair
   */
  @Post('/cipher-key-value')
  @OperationId('CipherKeyValue')
  @Produces('application/octet-stream')
  public async cipherKeyValue(
    @Body()
    body: {
      // TODO: this needs an "& unknown" for tsoa to add the description, but makes openapi-generator try to use `Array` instead of `Array<number>`
      /** BIP-32 path to the encrypting/decrypting key */
      address_n_list: types.AddressNList
      /**
       * a key name, which will be mixed into the encryption key
       * @minLength 1
       */
      key: string
      /**
       * decoded length must be a multiple of 16 bytes
       * @minLength 1
       * @contentEncoding byte
       */
      value: string
      /** decrypt ciphertext instead of encrypting plaintext */
      decrypt?: boolean
      /** don't encrypt without prompting the user (setting must match for both encryption and decryption) */
      ask_on_encrypt?: boolean
      /** don't decrypt without prompting the user (setting must match for both encryption and decryption) */
      ask_on_decrypt?: boolean
      /**
       * hex-encoded 16-byte initialization vector for AES-256-CBC
       * @minLength 32
       * @maxLength 32
       */
      iv: types.hex.bytes.Lower & unknown
    } & /** @title Encrypt */ (
      | {
          /** @title plaintext */
          value: string
          decrypt?: false
        }
      | /** @title Decrypt */ {
          /** @title ciphertext */
          value: string
          decrypt: true
        }
    ),
  ): Promise<Readable> {
    if (!this.context.wallet) throw undefined

    const value = Buffer.from(body.value, 'base64')
    if (value.length % 16 !== 0)
      throw new Error('decoded length of value must be a multiple of 16 bytes')

    const iv = Buffer.from(body.iv, 'hex')
    if (iv.length !== 16) throw new Error('decoded length of iv must be 16 bytes')

    const out = await this.context.wallet.cipherKeyValue({
      addressNList: body.address_n_list,
      key: body.key,
      value,
      encrypt: !body.decrypt,
      askOnEncrypt: body.ask_on_encrypt,
      askOnDecrypt: body.ask_on_decrypt,
      iv,
    })

    return Readable.from(typeof out === 'string' ? Buffer.from(out, 'base64') : out)
  }

  /**
   * Causes the device to forget any cached PIN or passphrase. (Does not end the API session.)
   * @summary Lock the device
   */
  @Post('/clear-session')
  @OperationId('ClearSession')
  public async clearSession(): Promise<void> {
    if (!this.context.wallet) throw undefined

    await this.context.wallet.clearSession()
  }

  /**
   * Updates the device's firmware
   * @summary Firmware update
   * @param skipErase skip the usual firmware erase operation and the associated warning screen
   */
  @Post('/firmware-update')
  @OperationId('FirmwareUpdate')
  @Consumes('application/octet-stream')
  public async firmwareUpdate(@Body() body: Buffer, @Query() skipErase?: boolean): Promise<void> {
    if (!this.context.wallet) throw undefined

    if (!skipErase) {
      await this.context.wallet.firmwareErase()
    }
    await this.context.wallet.firmwareUpload(body)
  }

  /**
   * @summary Sign an identity challenge
   */
  @Post('/sign-identity')
  @OperationId('SignIdentity')
  public async signIdentity(
    @Body()
    _body: // eslint-disable-line @typescript-eslint/no-unused-vars
    {
      /**
       * identity url
       * @format url
       */
      url: string
      /** identity index */
      index?: types.numeric.U32 & unknown
      /** challenge shown on display (e.g. date+time). (Ignored when signing with SSH or GPG identities.) */
      challenge_visual?: string
      /** hex-encoded non-visible challenge */
      challenge_hidden: types.hex.bytes.Lower & unknown
      /** ECDSA curve name to use */
      ecdsa_curve_name?: string
    },
  ): Promise<void> {
    if (!this.context.wallet) throw undefined

    throw new Error('signIdentity not supported')
  }

  /**
   * @summary Wipe keys and reset device
   */
  @Post('/wipe-device')
  @OperationId('WipeDevice')
  public async wipeDevice(): Promise<void> {
    if (!this.context.wallet) throw undefined

    await this.context.wallet.wipe()
  }
}
