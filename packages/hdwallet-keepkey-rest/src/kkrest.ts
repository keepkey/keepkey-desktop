import type * as Messages from '@keepkey/device-protocol/lib/messages_pb'
import type * as Types from '@keepkey/device-protocol/lib/types_pb'
import type { KeepKeySdk } from '@keepkey/keepkey-sdk'
import { FetchError } from '@keepkey/keepkey-sdk'
import * as core from '@shapeshiftoss/hdwallet-core'
import _ from 'lodash'
import semver from 'semver'

export type { KeepKeySdk } from '@keepkey/keepkey-sdk'

export function isKeepKey(wallet: core.HDWallet): wallet is KeepKeyRestHDWallet {
  return _.isObject(wallet) && (wallet as any)._isKeepKey
}

export class KeepKeyRestHDWallet
  implements core.HDWallet, core.BTCWallet, core.ETHWallet, core.DebugLinkWallet
{
  readonly _supportsETHInfo = true
  readonly _supportsBTCInfo = true
  readonly _supportsCosmosInfo = true
  readonly _supportsOsmosisInfo = true
  readonly _supportsRippleInfo = true
  readonly _supportsBinanceInfo = true
  readonly _supportsEosInfo = true
  readonly _supportsFioInfo = false
  readonly _supportsDebugLink = false
  readonly _isKeepKey = true
  readonly _supportsETH = true
  readonly _supportsEthSwitchChain = false
  readonly _supportsAvalanche = true
  readonly _supportsOptimism = true
  readonly _supportsBSC = true
  readonly _supportsBTC = true
  _supportsCosmos = true
  _supportsOsmosis = true
  _supportsRipple = true
  _supportsBinance = true
  _supportsEos = true
  readonly _supportsThorchainInfo = true
  readonly _supportsThorchain = true
  readonly _supportsSecretInfo = false
  readonly _supportsSecret = false
  readonly _supportsKava = false
  readonly _supportsKavaInfo = false
  readonly _supportsTerra = false
  readonly _supportsTerraInfo = false

  private readonly sdk: KeepKeySdk
  private readonly abortControllers = new Map<AbortController, Promise<void>>()

  protected constructor(sdk: KeepKeySdk) {
    this.sdk = sdk
  }

  protected async abortable<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const abortController = new AbortController()
    try {
      const promise = fn(abortController.signal)
      this.abortControllers.set(
        abortController,
        promise.then(
          () => {},
          () => {},
        ),
      )
      return await promise
    } catch (err) {
      if (err instanceof FetchError) {
        throw new core.ActionCancelled()
      }
      throw err
    } finally {
      this.abortControllers.delete(abortController)
    }
  }

  static async create(sdk: KeepKeySdk): Promise<KeepKeyRestHDWallet> {
    return new KeepKeyRestHDWallet(sdk)
  }

  public async getDeviceID(): Promise<string> {
    const features = await this.getFeatures()
    return features.deviceId!
  }

  public getVendor(): string {
    return 'KeepKey'
  }

  public async getModel(): Promise<string> {
    const features = await this.getFeatures()
    return core.mustBeDefined(features).model!
  }

  public async getFirmwareVersion(): Promise<string> {
    const features = await this.getFeatures()

    return `v${features.majorVersion}.${features.minorVersion}.${features.patchVersion}`
  }

  public async getLabel(): Promise<string> {
    const features = await this.getFeatures()
    return features.label ?? ''
  }

  public async isInitialized(): Promise<boolean> {
    const features = await this.getFeatures()
    return !!features.initialized
  }

  public async isLocked(): Promise<boolean> {
    const features = await this.getFeaturesUncached()
    if (features.pinProtection && !features.pinCached) return true
    if (features.passphraseProtection && !features.passphraseCached) return true
    return false
  }

  readonly getPublicKeys = _.memoize(
    async (getPublicKeys: core.GetPublicKey[]): Promise<(core.PublicKey | null)[]> => {
      return await this.abortable(async signal => {
        return await Promise.all(
          getPublicKeys.map(async x => {
            const scriptType = (() => {
              switch (x.scriptType) {
                case undefined:
                  return undefined
                case core.BTCInputScriptType.SpendAddress:
                  return 'p2pkh'
                case core.BTCInputScriptType.SpendWitness:
                  return 'p2wpkh'
                case core.BTCInputScriptType.SpendP2SHWitness:
                  return 'p2sh-p2wpkh'
                default:
                  throw new Error('bad scriptType')
              }
            })()
            return await this.sdk.system.info.getPublicKey(
              {
                coin_name: x.coin,
                script_type: scriptType,
                show_display: x.showDisplay,
                ecdsa_curve_name: x.curve,
                address_n: x.addressNList,
              },
              { signal },
            )
          }),
        )
      })
    },
    msg => JSON.stringify(msg),
  )

  public async ping(msg: core.Ping): Promise<core.Pong> {
    return await this.abortable(async signal => {
      const formattedMsg = {
        message: msg.msg,
        passphrase_protection: msg.passphrase,
        pin_protection: msg.pin,
        button_protection: msg.button,
      }
      const { message: respmsg } = await this.sdk.system.info.ping(formattedMsg, { signal })
      return { msg: respmsg }
    })
  }

  public async reset(msg: core.ResetDevice): Promise<void> {
    return await this.abortable(async signal => {
      console.log('sending reset', msg)
      await this.sdk.system.initialize.resetDevice(
        {
          u2f_counter: msg.u2fCounter,
          auto_lock_delay_ms: msg.autoLockDelayMs,
          label: msg.label,
          passphrase_protection: msg.passphrase,
          pin_protection: msg.pin,
          strength: msg.entropy,
        },
        { signal },
      )
    })
  }

  public async recover(msg: core.RecoverDevice): Promise<void> {
    return await this.abortable(async signal => {
      console.log('sending recoverDevice', msg)
      await this.sdk.system.initialize.recoverDevice(
        {
          u2f_counter: msg.u2fCounter,
          auto_lock_delay_ms: msg.autoLockDelayMs,
          label: msg.label,
          passphrase_protection: msg.passphrase,
          pin_protection: msg.pin,
          word_count: (() => {
            switch (msg.entropy) {
              case 128:
                return 12
              case 192:
                return 18
              case 256:
                return 24
              default:
                throw new Error('unsupported entropy value')
            }
          })(),
        },
        { signal },
      )
    })
  }

  public async pressYes(): Promise<void> {
    return this.press(true)
  }

  public async pressNo(): Promise<void> {
    return this.press(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async press(_isYes: boolean): Promise<void> {
    throw new Error('not implemented')
  }

  public hasOnDevicePinEntry(): boolean {
    return false
  }

  public hasOnDevicePassphrase(): boolean {
    return false
  }

  public hasOnDeviceDisplay(): boolean {
    return true
  }

  public hasOnDeviceRecovery(): boolean {
    return false
  }

  public supportsBip44Accounts(): boolean {
    return true
  }

  public supportsOfflineSigning(): boolean {
    return true
  }

  public supportsBroadcast(): boolean {
    return false
  }

  public async sendPin(): Promise<never> {
    throw new Error("pin entry is handled by the server, so don't call this")
  }

  public async sendPassphrase(): Promise<void> {
    throw new Error("passphrase entry is handled by the server, so don't call this")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async sendCharacter(_character: string): Promise<void> {
    throw new Error("character entry is handled by the server, so don't call this")
  }

  public async sendCharacterDelete(): Promise<void> {
    throw new Error("character entry is handled by the server, so don't call this")
  }

  public async sendCharacterDone(): Promise<void> {
    throw new Error("character entry is handled by the server, so don't call this")
  }

  public async sendWord(): Promise<never> {
    throw new Error('obsolete')
  }

  public hasNativeShapeShift(): boolean {
    return false
  }

  public btcSupportsNativeShapeShift(): boolean {
    return false
  }

  public ethSupportsNativeShapeShift(): boolean {
    return false
  }

  public async applyPolicy(p: Required<Types.PolicyType.AsObject>): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.applyPolicies(
        [
          {
            policy_name: p.policyName,
            enabled: p.enabled,
          },
        ],
        { signal },
      )
    })
  }

  public async applySettings(s: Messages.ApplySettings.AsObject): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.applySettings(
        {
          u2f_counter: s.u2fCounter,
          auto_lock_delay_ms: s.autoLockDelayMs,
          label: s.label,
          language: s.language,
          use_passphrase: s.usePassphrase,
        },
        { signal },
      )
    })
  }

  public async cancel(): Promise<void> {
    const inFlight = Array.from(this.abortControllers.values())
    this.abortControllers.forEach((_, abortController) => abortController.abort())
    this.abortControllers.clear()
    await Promise.allSettled(inFlight)
  }

  public async changePin(): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.changePin({}, { signal })
    })
  }

  public async clearSession(): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.clearSession({ signal })
    })
  }

  public async firmwareErase(): Promise<void> {
    // skipped, as this is done automatically by the server during firmwareUpload
  }

  public async firmwareUpload(firmware: Buffer): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.firmwareUpdate(new Blob([firmware]), undefined, { signal })
    })
  }

  public async initialize(): Promise<void> {
    // await this.sdk.developer.initialize({ body: {} });
  }

  protected async getFeaturesUncached(): Promise<Messages.Features.AsObject> {
    const raw = await this.sdk.system.info.getFeatures()
    return {
      vendor: raw.vendor,
      // TODO: openapi-generator has busted types on these
      majorVersion: raw.major_version as number | undefined,
      minorVersion: raw.minor_version as number | undefined,
      patchVersion: raw.patch_version as number | undefined,
      bootloaderMode: raw.bootloader_mode,
      pinProtection: raw.pin_protection,
      passphraseProtection: raw.passphrase_protection,
      deviceId: raw.device_id,
      model: raw.model,
      language: raw.language,
      label: raw.label,
      coinsList: [],
      initialized: raw.initialized,
      revision: Buffer.from((raw.revision as string | undefined) ?? '', 'utf8').toString('base64'),
      bootloaderHash: Buffer.from(
        (raw.bootloader_hash as string | undefined) ?? '',
        'hex',
      ).toString('base64'),
      firmwareHash: Buffer.from((raw.firmware_hash as string | undefined) ?? '', 'hex').toString(
        'base64',
      ),
      imported: raw.imported,
      pinCached: raw.pin_cached,
      passphraseCached: raw.passphrase_cached,
      policiesList: (raw.policies ?? []).map(x => ({
        policyName: x.policy_name,
        enabled: x.enabled,
      })),
      firmwareVariant: raw.firmware_variant,
      noBackup: raw.no_backup,
      wipeCodeProtection: raw.wipe_code_protection,
      autoLockDelayMs: raw.auto_lock_delay_ms as number | undefined,
    }
  }

  protected readonly getFeaturesCached = _.memoize(
    async (): Promise<Messages.Features.AsObject> => {
      return await this.getFeaturesUncached()
    },
  )

  protected resetCaches() {
    this.getFeaturesCached.cache = new _.memoize.Cache()
    this.btcGetAddress.cache = new _.memoize.Cache()
    this.ethGetAddress.cache = new _.memoize.Cache()
    this.rippleGetAddress.cache = new _.memoize.Cache()
    this.cosmosGetAddress.cache = new _.memoize.Cache()
    this.osmosisGetAddress.cache = new _.memoize.Cache()
    this.thorchainGetAddress.cache = new _.memoize.Cache()
    this.binanceGetAddress.cache = new _.memoize.Cache()
    this.eosGetPublicKey.cache = new _.memoize.Cache()
    this.getPublicKeys.cache = new _.memoize.Cache()
  }

  public async getFeatures(cached?: boolean): Promise<Messages.Features.AsObject> {
    if (!(cached ?? true)) {
      this.resetCaches()
    }
    return await this.getFeaturesCached()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getEntropy(_size: number): Promise<Uint8Array> {
    throw new Error('not implemented')
  }

  public async getNumCoins(): Promise<number> {
    throw new Error('not implemented')
  }

  public async getCoinTable(
    start = 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _end: number = start + 10,
  ): Promise<Types.CoinType.AsObject[]> {
    throw new Error('not implemented')
  }

  public async loadDevice(msg: core.LoadDevice): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.initialize.loadDevice(
        {
          mnemonic: msg.mnemonic,
          label: msg.label,
          passphrase_protection: msg.passphrase,
          pin: msg.pin,
          skip_checksum: msg.skipChecksum,
          // TODO: openapi-generator typing is busted here
          xprv: '',
        },
        { signal },
      )
    })
  }

  public async removePin(): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.changePin({ remove: true }, { signal })
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async send(_events: core.Event[]): Promise<void> {
    throw new Error('not implemented')
  }

  public async softReset(): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.manufacturing.softReset({ signal })
    })
  }

  public async wipe(): Promise<void> {
    return await this.abortable(async signal => {
      await this.sdk.system.wipeDevice({ signal })
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async btcSupportsCoin(_coin: core.Coin): Promise<boolean> {
    return true
  }

  public async btcSupportsScriptType(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _coin: core.Coin,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _scriptType: core.BTCInputScriptType,
  ): Promise<boolean> {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readonly btcGetAddress = _.memoize(
    async (msg: core.BTCGetAddress): Promise<string> => {
      return await this.abortable(async signal => {
        return (
          await this.sdk.address.utxoGetAddress(
            {
              script_type: msg.scriptType,
              coin: msg.coin,
              address_n: msg.addressNList,
              show_display: msg.showDisplay,
            },
            { signal },
          )
        ).address
      })
    },
    msg => JSON.stringify(msg),
  )

  public async btcSignTx(msg: core.BTCSignTxKK): Promise<core.BTCSignedTx> {
    return await this.abortable(async signal => {
      const { serializedTx } = await this.sdk.utxo.utxoSignTransaction(msg, { signal })
      return {
        signatures: core.untouchable('signatures field not implemented'),
        serializedTx: serializedTx as string,
      }
    })
  }

  public async btcSupportsSecureTransfer(): Promise<boolean> {
    return false
  }

  public async ethSupportsEIP1559(): Promise<boolean> {
    return semver.gte(await this.getFirmwareVersion(), 'v7.2.1')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async btcSignMessage(_msg: core.BTCSignMessage): Promise<core.BTCSignedMessage> {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async btcVerifyMessage(_msg: core.BTCVerifyMessage): Promise<boolean> {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public btcGetAccountPaths(_msg: core.BTCGetAccountPaths): core.BTCAccountPath[] {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public btcIsSameAccount(_msg: core.BTCAccountPath[]): boolean {
    throw new Error('not implemented')
  }

  public async ethSignTx(msg: core.ETHSignTx): Promise<core.ETHSignedTx> {
    return await this.abortable(async signal => {
      console.log('MSG: ', msg)
      if (!msg.data) msg.data = '0x'
      const sig = await this.sdk.eth.ethSignTransaction(
        {
          nonce: msg.nonce,
          value: msg.value,
          data: msg.data,
          from: (
            await this.sdk.address.ethereumGetAddress({ address_n: msg.addressNList }, { signal })
          ).address,
          to: msg.to,
          gas: msg.gasLimit,
          // TODO: openapi-generator types are terrible
          // @ts-expect-error
          gasPrice: msg.gasPrice,
          // @ts-expect-error
          maxFeePerGas: msg.maxFeePerGas,
          // @ts-expect-error
          maxPriorityFeePerGas: msg.maxPriorityFeePerGas,
          chainId: msg.chainId,
        },
        { signal },
      )
      return {
        v: sig.v as number,
        r: sig.r,
        s: sig.s,
        serialized: sig.serialized,
      }
    })
  }

  // TODO check if sdk supports below messages

  readonly ethGetAddress = _.memoize(
    async (msg: core.ETHGetAddress): Promise<string> => {
      return await this.abortable(async signal => {
        return (
          await this.sdk.address.ethereumGetAddress(
            {
              address_n: msg.addressNList,
              show_display: msg.showDisplay,
            },
            { signal },
          )
        ).address
      })
    },
    msg => JSON.stringify(msg),
  )

  public async ethSignMessage(msg: core.ETHSignMessage): Promise<core.ETHSignedMessage> {
    return await this.abortable(async signal => {
      const address = (
        await this.sdk.address.ethereumGetAddress({ address_n: msg.addressNList }, { signal })
      ).address
      const message = `0x${Buffer.from(
        Uint8Array.from(
          typeof msg.message === 'string' ? new TextEncoder().encode(msg.message) : msg.message,
        ),
      ).toString('hex')}`
      // TODO: openapi-generator types are terrible
      const signature = (await this.sdk.eth.ethSign(
        {
          address,
          message,
        },
        { signal },
      )) as string
      return {
        address,
        signature,
      }
    })
  }

  public async ethSignTypedData(msg: any): Promise<core.ETHSignedTypedData> {
    return await this.abortable(async signal => {
      console.log('msg: ', msg)
      console.log('msg: ', JSON.stringify(msg))
      const address = (
        await this.sdk.address.ethereumGetAddress({ address_n: msg.addressNList }, { signal })
      ).address
      // TODO: openapi-generator types are terrible
      const signature = (await this.sdk.eth.ethSignTypedData(
        {
          // (Our types are a bit stricter than the ones from the eip712 library.)
          typedData: msg.typedData,
          address,
        },
        { signal },
      )) as string
      return {
        address,
        signature,
      }
    })
  }

  public async ethVerifyMessage(msg: core.ETHVerifyMessage): Promise<boolean> {
    return await this.abortable(async signal => {
      const message = `0x${Buffer.from(
        Uint8Array.from(
          typeof msg.message === 'string' ? new TextEncoder().encode(msg.message) : msg.message,
        ),
      ).toString('hex')}`
      const output = await this.sdk.eth.ethVerify(
        {
          signature: msg.signature,
          address: msg.address,
          message,
        },
        { signal },
      )
      return output
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async ethSupportsNetwork(_chain_id: number): Promise<boolean> {
    return true
  }

  public async ethSupportsSecureTransfer(): Promise<boolean> {
    return false
  }

  public ethGetAccountPaths(msg: core.ETHGetAccountPath): core.ETHAccountPath[] {
    const slip44 = core.slip44ByCoin(msg.coin)
    if (slip44 === undefined) return []
    return [
      {
        addressNList: [0x80000000 + 44, 0x80000000 + slip44, 0x80000000 + msg.accountIdx, 0, 0],
        hardenedPath: [0x80000000 + 44, 0x80000000 + slip44, 0x80000000 + msg.accountIdx],
        relPath: [0, 0],
        description: 'KeepKey',
      },
    ]
  }

  public rippleGetAccountPaths(msg: core.RippleGetAccountPaths): core.RippleAccountPath[] {
    return [
      {
        addressNList: [
          0x80000000 + 44,
          0x80000000 + core.slip44ByCoin('Ripple'),
          0x80000000 + msg.accountIdx,
          0,
          0,
        ],
      },
    ]
  }

  readonly rippleGetAddress = _.memoize(
    async (msg: core.RippleGetAddress): Promise<string> => {
      return await this.abortable(async signal => {
        return (
          await this.sdk.address.xrpGetAddress(
            {
              address_n: msg.addressNList,
              show_display: msg.showDisplay,
            },
            { signal },
          )
        ).address
      })
    },
    msg => JSON.stringify(msg),
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async rippleSignTx(msg: core.RippleSignTx): Promise<core.RippleSignedTx> {
    throw new Error('not implemented')
  }

  public cosmosGetAccountPaths(msg: core.CosmosGetAccountPaths): core.CosmosAccountPath[] {
    return [
      {
        addressNList: [
          0x80000000 + 44,
          0x80000000 + core.slip44ByCoin('Atom'),
          0x80000000 + msg.accountIdx,
          0,
          0,
        ],
      },
    ]
  }

  readonly cosmosGetAddress = _.memoize(
    async (msg: core.CosmosGetAddress): Promise<string> => {
      return await this.abortable(async signal => {
        return (
          await this.sdk.address.cosmosGetAddress(
            {
              address_n: msg.addressNList,
              show_display: msg.showDisplay,
            },
            { signal },
          )
        ).address
      })
    },
    msg => JSON.stringify(msg),
  )

  public async cosmosSignTx(msg: core.CosmosSignTx): Promise<core.CosmosSignedTx> {
    return await this.abortable(async signal => {
      const signerAddress = (
        await this.sdk.address.cosmosGetAddress(
          {
            address_n: msg.addressNList,
          },
          { signal },
        )
      ).address

      let signed
      //switch statement
      switch(msg.tx.msg[0].type) {
        case "cosmos-sdk/MsgSend":
          signed = await this.sdk.cosmos.cosmosSignAmino(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgDelegate":
          signed = await this.sdk.cosmos.cosmosSignAminoDelegate(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgReDelegate":
          signed = await this.sdk.cosmos.cosmosSignAminoRedelegate(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgUnDelegate":
          signed = await this.sdk.cosmos.cosmosSignAminoUndelegate(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgWithdrawDelegationReward":
          signed = await this.sdk.cosmos.cosmosSignAminoWithdrawDelegatorRewardsAll(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgTransfer":
          signed = await this.sdk.cosmos.cosmosSignAminoIbcTransfer(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo || ' ',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        default:
          throw Error("osmo Msg not supported "+msg.tx.msg[0].type)
      }

      return {
        signatures: [signed.signature as string],
        serialized: signed.serialized as string,
        authInfoBytes: core.untouchable('not implemented'),
        body: core.untouchable('not implemented'),
      }
    })
  }

  public osmosisGetAccountPaths(msg: core.OsmosisGetAccountPaths): core.OsmosisAccountPath[] {
    return [
      {
        addressNList: [
          0x80000000 + 44,
          0x80000000 + core.slip44ByCoin('Osmo'),
          0x80000000 + msg.accountIdx,
          0,
          0,
        ],
      },
    ]
  }

  readonly osmosisGetAddress = _.memoize(
      async (msg: core.OsmosisGetAddress): Promise<string> => {
        return await this.abortable(async signal => {
          return (
              await this.sdk.address.osmosisGetAddress(
                  {
                    address_n: msg.addressNList,
                    show_display: msg.showDisplay,
                  },
                  { signal },
              )
          ).address
        })
      },
      msg => JSON.stringify(msg),
  )

  public async osmosisSignTx(msg: core.OsmosisSignTx): Promise<core.OsmosisSignedTx> {
    return await this.abortable(async signal => {
      const signerAddress = (
          await this.sdk.address.osmosisGetAddress(
              {
                address_n: msg.addressNList,
              },
              { signal },
          )
      ).address
      
      let signed
      //switch statement
      switch(msg.tx.msg[0].type) {
        case "cosmos-sdk/MsgSend":
          signed = await this.sdk.osmosis.osmosisSignAmino(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgDelegate":
          signed = await this.sdk.osmosis.osmoSignAminoDelegate(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgReDelegate":
          signed = await this.sdk.osmosis.osmoSignAminoRedelegate(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgUnDelegate":
          signed = await this.sdk.osmosis.osmoSignAminoUndelegate(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgWithdrawDelegationReward":
          signed = await this.sdk.osmosis.osmoSignAminoWithdrawDelegatorRewardsAll(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "cosmos-sdk/MsgTransfer":
          signed = await this.sdk.osmosis.osmoSignAminoIbcTransfer(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "osmosis/gamm/join-pool":
          signed = await this.sdk.osmosis.osmoSignAminoLpAdd(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo || '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "osmosis/gamm/exit-pool":
          signed = await this.sdk.osmosis.osmoSignAminoLpRemove(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        case "osmosis/gamm/swap-exact-amount-in": //mosis/gamm/swap-exact-amount-in
          signed = await this.sdk.osmosis.osmoSignAminoSwap(
              {
                signDoc: {
                  account_number: msg.account_number,
                  chain_id: msg.chain_id,
                  // TODO: busted openapi-generator types
                  // @ts-expect-error
                  msgs: msg.tx.msg,
                  memo: msg.tx.memo ?? '',
                  sequence: msg.sequence,
                  fee: {
                    gas: String(msg.fee ?? 0),
                    amount: [],
                  },
                },
                signerAddress,
              },
              { signal },
          )
          break;
        default:
          throw Error("Msg not supported "+msg.tx.msg[0].type)
      }
      
      return {
        signatures: [signed.signature as string],
        serialized: signed.serialized as string,
        authInfoBytes: core.untouchable('not implemented'),
        body: core.untouchable('not implemented'),
      }
    })
  }
  
  public thorchainGetAccountPaths(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _msg: core.ThorchainGetAccountPaths,
  ): core.ThorchainAccountPath[] {
    throw new Error('not implemented')
  }

  readonly thorchainGetAddress = _.memoize(
    async (msg: core.ThorchainGetAddress): Promise<string> => {
      return await this.abortable(async signal => {
        return (
          await this.sdk.address.thorchainGetAddress(
            {
              address_n: msg.addressNList,
              show_display: msg.showDisplay,
            },
            { signal },
          )
        ).address
      })
    },
    msg => JSON.stringify(msg),
  )

  public async thorchainSignTx(msg: core.ThorchainSignTx): Promise<core.ThorchainSignedTx> {
    return await this.abortable(async signal => {
      const signerAddress = (
        await this.sdk.address.thorchainGetAddress(
          {
            address_n: msg.addressNList,
          },
          { signal },
        )
      ).address
      const signed = await this.sdk.cosmos.cosmosSignAmino(
        {
          signDoc: {
            accountNumber: msg.account_number,
            chainId: msg.chain_id,
            // TODO: busted openapi-generator types
            // @ts-expect-error
            msgs: msg.tx.msg,
            memo: msg.tx.memo ?? '',
            sequence: msg.sequence,
            fee: {
              gas: String(msg.fee ?? 0),
              amount: [],
            },
          },
          signerAddress,
        },
        { signal },
      )
      // TODO: busted openapi-generator types
      return {
        signatures: [signed.signature as string],
        serialized: core.untouchable('not implemented'),
        authInfoBytes: core.untouchable('not implemented'),
        body: core.untouchable('not implemented'),
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public binanceGetAccountPaths(_msg: core.BinanceGetAccountPaths): core.BinanceAccountPath[] {
    throw new Error('not implemented')
  }

  readonly binanceGetAddress = _.memoize(
    async (msg: core.BinanceGetAddress): Promise<string> => {
      return await this.abortable(async signal => {
        // TODO: busted openapi-generator types
        return (
          await this.sdk.address.binanceGetAddress(
            {
              address_n: msg.addressNList,
              show_display: msg.showDisplay,
            },
            { signal },
          )
        ).address as string
      })
    },
    msg => JSON.stringify(msg),
  )

  public async binanceSignTx(msg: core.BinanceSignTx): Promise<core.BinanceSignedTx> {
    // TODO: busted openapi-generator types
    // @ts-expect-error
    return await this.abortable(async signal => {
      const signerAddress = await this.sdk.address.binanceGetAddress(
        {
          address_n: msg.addressNList,
        },
        { signal },
      )
      const signed = await this.sdk.bnb.bnbSignTransaction(
        {
          signDoc: {
            account_number: msg.tx.account_number ?? '',
            chain_id: msg.tx.chain_id ?? '',
            msgs: msg.tx.msgs,
            memo: msg.tx.memo ?? '',
            sequence: msg.tx.sequence ?? '',
            source: msg.tx.source ?? '',
          },
          signerAddress,
        },
        { signal },
      )
      return { signatures: { signature: signed.signature } }
    })
  }

  public eosGetAccountPaths(msg: core.EosGetAccountPaths): core.EosAccountPath[] {
    return [
      {
        addressNList: [
          0x80000000 + 44,
          0x80000000 + core.slip44ByCoin('Eos'),
          0x80000000 + msg.accountIdx,
          0,
          0,
        ],
      },
    ]
  }

  readonly eosGetPublicKey = _.memoize(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (msg: core.EosGetPublicKey): Promise<string> => {
      throw new Error('not implemented')
    },
    msg => JSON.stringify(msg),
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async eosSignTx(msg: core.EosToSignTx): Promise<core.EosTxSigned> {
    throw new Error('not implemented')
  }

  public describePath(msg: core.DescribePath): core.PathDescription {
    switch (msg.coin) {
      case 'Ethereum':
        return core.describeETHPath(msg.path)
      case 'Atom':
        return core.cosmosDescribePath(msg.path)
      case 'Binance':
        return core.binanceDescribePath(msg.path)
      default:
        return core.describeUTXOPath(msg.path, msg.coin, msg.scriptType as core.BTCInputScriptType)
    }
  }

  public async disconnect(): Promise<void> {
    // does nothing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public btcNextAccountPath(_msg: core.BTCAccountPath): core.BTCAccountPath | undefined {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public ethNextAccountPath(_msg: core.ETHAccountPath): core.ETHAccountPath | undefined {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public eosNextAccountPath(_msg: core.EosAccountPath): core.EosAccountPath | undefined {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public cosmosNextAccountPath(_msg: core.CosmosAccountPath): core.CosmosAccountPath | undefined {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public rippleNextAccountPath(_msg: core.RippleAccountPath): core.RippleAccountPath | undefined {
    throw new Error('not implemented')
  }

  public binanceNextAccountPath(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _msg: core.BinanceAccountPath,
  ): core.BinanceAccountPath | undefined {
    throw new Error('not implemented')
  }
}
