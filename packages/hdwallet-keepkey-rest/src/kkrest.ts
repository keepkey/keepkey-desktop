import * as Messages from "@keepkey/device-protocol/lib/messages_pb";
import * as Types from "@keepkey/device-protocol/lib/types_pb";
import * as core from "@shapeshiftoss/hdwallet-core";
import _ from "lodash";
import semver from "semver";

export function isKeepKey(wallet: core.HDWallet): wallet is KeepKeyRestHDWallet {
  return _.isObject(wallet) && (wallet as any)._isKeepKey;
}

export type KeepKeySdk = any;

type Features = {
  deviceId: string
  model: string
  majorVersion: string | number
  minorVersion: string | number
  patchVersion: string | number
  label: string
  initialized: boolean
  pinProtection: boolean
  pinCached: boolean
  passphraseProtection: boolean
  passphraseCached: boolean
}

export class KeepKeyRestHDWallet implements core.HDWallet, core.BTCWallet, core.ETHWallet, core.DebugLinkWallet {
  readonly _supportsETHInfo = true;
  readonly _supportsBTCInfo = true;
  readonly _supportsCosmosInfo = true;
  readonly _supportsRippleInfo = true;
  readonly _supportsBinanceInfo = true;
  readonly _supportsEosInfo = true;
  readonly _supportsFioInfo = false;
  readonly _supportsDebugLink = false;
  readonly _isKeepKey = true;
  readonly _supportsETH = true;
  readonly _supportsEthSwitchChain = false;
  readonly _supportsAvalanche = false;
  readonly _supportsBTC = true;
  _supportsCosmos = true;
  _supportsRipple = true;
  _supportsBinance = true;
  _supportsEos = true;
  readonly _supportsThorchainInfo = true;
  readonly _supportsThorchain = true;
  readonly _supportsSecretInfo = false;
  readonly _supportsSecret = false;
  readonly _supportsKava = false;
  readonly _supportsKavaInfo = false;
  readonly _supportsTerra = false;
  readonly _supportsTerraInfo = false;

  private readonly sdk: KeepKeySdk;

  protected constructor(sdk: KeepKeySdk) {
    this.sdk = sdk;
  }

  static async create(sdk: KeepKeySdk): Promise<KeepKeyRestHDWallet> {
    return new KeepKeyRestHDWallet(sdk)
  }

  public async getDeviceID(): Promise<string> {
    const features = await this.getFeatures();
    return features.deviceId;
  }

  public getVendor(): string {
    return "KeepKey";
  }

  public async getModel(): Promise<string> {
    const features = await this.getFeatures()
    return core.mustBeDefined(features).model;
  }

  public async getFirmwareVersion(): Promise<string> {
    const features = await this.getFeatures()

    return `v${features.majorVersion}.${features.minorVersion}.${features.patchVersion}`;
  }

  public async getLabel(): Promise<string> {
    const features = await this.getFeatures()
    return features.label ?? "";
  }

  public async isInitialized(): Promise<boolean> {
    const features = await this.getFeatures()
    return !!features.initialized;
  }

  public async isLocked(): Promise<boolean> {
    const features = await this.getFeaturesUncached();
    if (features.pinProtection && !features.pinCached) return true;
    if (features.passphraseProtection && !features.passphraseCached) return true;
    return false;
  }

  readonly getPublicKeys = _.memoize(async (getPublicKeys: Array<core.GetPublicKey>): Promise<Array<core.PublicKey | null>> => {
    return await this.sdk.wallet.getPublicKeys({ getPublicKey: getPublicKeys })
  })

  public async ping(_msg: core.Ping): Promise<core.Pong> {
    throw new Error("not implemented");
  }

  public async reset(msg: core.ResetDevice): Promise<void> {
    await this.sdk.developer.reset(msg);
  }

  public async recover(r: core.RecoverDevice): Promise<void> {
    await this.sdk.recovery.recover(r);
  }

  public async pressYes(): Promise<void> {
    return this.press(true);
  }

  public async pressNo(): Promise<void> {
    return this.press(false);
  }

  public async press(_isYes: boolean): Promise<void> {
    throw new Error("not implemented");
  }

  public hasOnDevicePinEntry(): boolean {
    return false;
  }

  public hasOnDevicePassphrase(): boolean {
    return false;
  }

  public hasOnDeviceDisplay(): boolean {
    return true;
  }

  public hasOnDeviceRecovery(): boolean {
    return false;
  }

  public supportsBip44Accounts(): boolean {
    return true;
  }

  public supportsOfflineSigning(): boolean {
    return true;
  }

  public supportsBroadcast(): boolean {
    return false;
  }

  public async sendPin(): Promise<never> {
    throw new Error("pin entry is handled by the server, so don't call this")
  }

  public async sendPassphrase(passphrase: string): Promise<void> {
    return await this.sdk.recovery.sendPassphrase({ passphrase });
  }

  public async sendCharacter(character: string): Promise<void> {
    await this.sendCharacterProto(character, false, false);
  }

  public async sendCharacterDelete(): Promise<void> {
    await this.sendCharacterProto("", true, false);
  }

  public async sendCharacterDone(): Promise<void> {
    await this.sendCharacterProto("", false, true);
  }

  public async sendWord(): Promise<never> {
    throw new Error("obsolete")
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

  protected async sendCharacterProto(character: string, _delete: boolean, _done: boolean): Promise<any> {
    await this.sdk.recovery.sendCharacterProto({ sendCharacterProto: { character, _delete, done: _done } });
  }

  public async applyPolicy(p: Required<Types.PolicyType.AsObject>): Promise<void> {
    await this.sdk.developer.applyPolicy({ body: p });
  }

  public async applySettings(s: Messages.ApplySettings.AsObject): Promise<void> {
    await this.sdk.developer.applySettings({ body: s });
  }

  public async cancel(): Promise<void> {
    await this.sdk.developer.cancel({ body: undefined });
  }

  public async changePin(): Promise<void> {
    await this.sdk.recovery.changePin({ body: undefined });
  }

  public async clearSession(): Promise<void> {
    await this.sdk.developer.clearSession({ body: undefined });
  }

  public async firmwareErase(): Promise<void> {
    await this.sdk.developer.firmwareErase({ body: undefined });
  }

  public async firmwareUpload(firmware: Buffer): Promise<void> {
    await this.sdk.developer.firmwareUpload({ body: firmware });
  }

  public async initialize(): Promise<void> {
    await this.sdk.developer.initialize({ body: {} });
  }

  public async getFeaturesUncached(): Promise<Features> {
    return JSON.parse(await this.sdk.developer.getFeatures())
  }

  readonly getFeatures = _.memoize(async (): Promise<Features> => {
    return await this.getFeaturesUncached()
  })

  public async getEntropy(_size: number): Promise<Uint8Array> {
    throw new Error("not implemented");
  }

  public async getNumCoins(): Promise<number> {
    throw new Error("not implemented");
  }

  public async getCoinTable(start = 0, _end: number = start + 10): Promise<Types.CoinType.AsObject[]> {
    throw new Error("not implemented");
  }

  public async loadDevice(msg: core.LoadDevice): Promise<void> {
    await this.sdk.developer.loadDevice({ loadDevice: msg });
  }

  public async removePin(): Promise<void> {
    return await this.sdk.developer.removePin({});
  }

  public async send(_events: core.Event[]): Promise<void> {
    throw new Error("not implemented");
  }

  public async softReset(): Promise<void> {
    await this.sdk.developer.softReset({ body: undefined });
  }

  public async wipe(): Promise<void> {
    await this.sdk.developer.wipe({ body: undefined });
  }

  public async btcSupportsCoin(_coin: core.Coin): Promise<boolean> {
    return true;
  }

  public async btcSupportsScriptType(_coin: core.Coin, _scriptType: core.BTCInputScriptType): Promise<boolean> {
    return true;
  }

  readonly btcGetAddress = _.memoize(async (msg: core.BTCGetAddress): Promise<string> => {
    return (await this.sdk.wallet.btcGetAddress({ btcGetAddress: msg })).replace(/"/g, "")
  })

  public async btcSignTx(msg: core.BTCSignTxKK): Promise<core.BTCSignedTx> {
    const addressResponse = await this.sdk.sign.btcSignTx({ body: msg });
    return addressResponse;
  }

  public async btcSupportsSecureTransfer(): Promise<boolean> {
    return false;
  }

  public async ethSupportsEIP1559(): Promise<boolean> {
    return semver.gte(await this.getFirmwareVersion(), "v7.2.1");
  }

  public async btcSignMessage(_msg: core.BTCSignMessage): Promise<core.BTCSignedMessage> {
    throw new Error("not implemented");
  }

  public async btcVerifyMessage(_msg: core.BTCVerifyMessage): Promise<boolean> {
    throw new Error("not implemented");
  }

  public btcGetAccountPaths(_msg: core.BTCGetAccountPaths): Array<core.BTCAccountPath> {
    throw new Error("not implemented");
  }

  public btcIsSameAccount(_msg: Array<core.BTCAccountPath>): boolean {
    throw new Error("not implemented");
  }

  public async ethSignTx(msg: core.ETHSignTx): Promise<core.ETHSignedTx> {
    const signedResponse = await this.sdk.sign.ethSignTx({ body: msg });
    return signedResponse;
  }

  // TODO check if sdk supports below messages

  readonly ethGetAddress = _.memoize(async (msg: core.ETHGetAddress): Promise<string> => {
    return (await this.sdk.wallet.ethGetAddress({ ethGetAddress: msg })).replace(/"/g, "")
  })

  public async ethSignMessage(_msg: core.ETHSignMessage): Promise<core.ETHSignedMessage> {
    throw new Error("not implemented");
  }

  public async ethSignTypedData(_msg: core.ETHSignTypedData): Promise<core.ETHSignedTypedData> {
    throw new Error("not implemented");
  }

  public async ethVerifyMessage(_msg: core.ETHVerifyMessage): Promise<boolean> {
    throw new Error("not implemented");
  }

  public async ethSupportsNetwork(_chain_id: number): Promise<boolean> {
    return true;
  }

  public async ethSupportsSecureTransfer(): Promise<boolean> {
    return false;
  }

  public ethGetAccountPaths(msg: core.ETHGetAccountPath): Array<core.ETHAccountPath> {
    const slip44 = core.slip44ByCoin(msg.coin);
    if (slip44 === undefined) return [];
    return [
      {
        addressNList: [0x80000000 + 44, 0x80000000 + slip44, 0x80000000 + msg.accountIdx, 0, 0],
        hardenedPath: [0x80000000 + 44, 0x80000000 + slip44, 0x80000000 + msg.accountIdx],
        relPath: [0, 0],
        description: "KeepKey",
      },
    ];
  }

  public rippleGetAccountPaths(msg: core.RippleGetAccountPaths): Array<core.RippleAccountPath> {
    return [
      {
        addressNList: [0x80000000 + 44, 0x80000000 + core.slip44ByCoin("Ripple"), 0x80000000 + msg.accountIdx, 0, 0],
      },
    ];
  }

  readonly rippleGetAddress = _.memoize(async (msg: core.RippleGetAddress): Promise<string> => {
    return (await this.sdk.wallet.rippleGetAddress({ rippleGetAddress: msg })).replace(/"/g, "")
  })

  public async rippleSignTx(msg: core.RippleSignTx): Promise<core.RippleSignedTx> {
    const rippleSignTxResponse = await this.sdk.sign.rippleSignTx({ rippleSignTx: msg });
    return rippleSignTxResponse;
  }

  public cosmosGetAccountPaths(msg: core.CosmosGetAccountPaths): Array<core.CosmosAccountPath> {
    return [
      {
        addressNList: [0x80000000 + 44, 0x80000000 + core.slip44ByCoin("Atom"), 0x80000000 + msg.accountIdx, 0, 0],
      },
    ];
  }

  readonly cosmosGetAddress = _.memoize(async (msg: core.CosmosGetAddress): Promise<string> => {
    return (await this.sdk.wallet.cosmosGetAddress({ cosmosGetAddress: msg })).replace(/"/g, "")
  })

  public async cosmosSignTx(msg: core.CosmosSignTx): Promise<core.CosmosSignedTx> {
    return this.sdk.sign.cosmosSignTx({ cosmosSignTx: msg });
  }

  public thorchainGetAccountPaths(_msg: core.ThorchainGetAccountPaths): Array<core.ThorchainAccountPath> {
    throw new Error("not implemented");
  }

  readonly thorchainGetAddress = _.memoize(async (msg: core.ThorchainGetAddress): Promise<string> => {
    return (await this.sdk.wallet.thorchainGetAddress({ thorchainGetAddress: msg })).replace(/"/g, "")
  })

  public async thorchainSignTx(msg: core.ThorchainSignTx): Promise<core.ThorchainSignedTx> {
    return this.sdk.sign.thorchainSignTx({ thorchainSignTx: msg });
  }

  public binanceGetAccountPaths(_msg: core.BinanceGetAccountPaths): Array<core.BinanceAccountPath> {
    throw new Error("not implemented");
  }

  readonly binanceGetAddress = _.memoize(async (msg: core.BinanceGetAddress): Promise<string> => {
    return (await this.sdk.wallet.binanceGetAddress({ binanceGetAddress: msg })).replace(/"/g, "")
  })

  public async binanceSignTx(msg: core.BinanceSignTx): Promise<core.BinanceSignedTx> {
    return await this.sdk.sign.binanceSignTx({ body: msg });
  }

  public eosGetAccountPaths(msg: core.EosGetAccountPaths): Array<core.EosAccountPath> {
    return [
      {
        addressNList: [0x80000000 + 44, 0x80000000 + core.slip44ByCoin("Eos"), 0x80000000 + msg.accountIdx, 0, 0],
      },
    ];
  }

  readonly eosGetPublicKey = _.memoize(async (msg: core.EosGetPublicKey): Promise<string> => {
    return (await this.sdk.wallet.eosGetPublicKey({ eosGetPublicKey: msg })).replace(/"/g, "")
  })

  public async eosSignTx(msg: core.EosToSignTx): Promise<core.EosTxSigned> {
    return await this.sdk.sign.eosSignTx({ body: msg });
  }

  public describePath(msg: core.DescribePath): core.PathDescription {
    switch (msg.coin) {
      case "Ethereum":
        return core.describeETHPath(msg.path);
      case "Atom":
        return core.cosmosDescribePath(msg.path);
      case "Binance":
        return core.binanceDescribePath(msg.path);
      default:
        return core.describeUTXOPath(msg.path, msg.coin, msg.scriptType as core.BTCInputScriptType);
    }
  }

  public async disconnect(): Promise<void> {
    this.sdk.developer.disconnect({ body: undefined });
  }

  public btcNextAccountPath(_msg: core.BTCAccountPath): core.BTCAccountPath | undefined {
    throw new Error("not implemented");
  }

  public ethNextAccountPath(_msg: core.ETHAccountPath): core.ETHAccountPath | undefined {
    throw new Error("not implemented");
  }

  public eosNextAccountPath(_msg: core.EosAccountPath): core.EosAccountPath | undefined {
    throw new Error("not implemented");
  }

  public cosmosNextAccountPath(_msg: core.CosmosAccountPath): core.CosmosAccountPath | undefined {
    throw new Error("not implemented");
  }

  public rippleNextAccountPath(_msg: core.RippleAccountPath): core.RippleAccountPath | undefined {
    throw new Error("not implemented");
  }

  public binanceNextAccountPath(_msg: core.BinanceAccountPath): core.BinanceAccountPath | undefined {
    throw new Error("not implemented");
  }
}
