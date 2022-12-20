/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Messages from "@keepkey/device-protocol/lib/messages_pb";
import * as Types from "@keepkey/device-protocol/lib/types_pb";
import * as core from "@shapeshiftoss/hdwallet-core";
import { BTCInputScriptType, describeUTXOPath } from "@shapeshiftoss/hdwallet-core";
import _ from "lodash";
import semver from "semver";

export function isKeepKey(wallet: core.HDWallet): wallet is KeepKeyRestHDWallet {
  return _.isObject(wallet) && (wallet as any)._isKeepKey;
}

function describeETHPath(path: core.BIP32Path): core.PathDescription {
  const pathStr = core.addressNListToBIP32(path);
  const unknown: core.PathDescription = {
    verbose: pathStr,
    coin: "Ethereum",
    isKnown: false,
  };

  if (path.length != 5) return unknown;

  if (path[0] != 0x80000000 + 44) return unknown;

  if (path[1] != 0x80000000 + core.slip44ByCoin("Ethereum")) return unknown;

  if ((path[2] & 0x80000000) >>> 0 !== 0x80000000) return unknown;

  if (path[3] != 0) return unknown;

  if (path[4] != 0) return unknown;

  const index = path[2] & 0x7fffffff;
  return {
    verbose: `Ethereum Account #${index}`,
    accountIdx: index,
    wholeAccount: true,
    coin: "Ethereum",
    isKnown: true,
    isPrefork: false,
  };
}

// function describeUTXOPath(
//   path: core.BIP32Path,
//   coin: core.Coin,
//   scriptType?: core.BTCInputScriptType
// ): core.PathDescription {
//   const pathStr = core.addressNListToBIP32(path);
//   const unknown: core.PathDescription = {
//     verbose: pathStr,
//     coin,
//     scriptType,
//     isKnown: false,
//   };
//   if (!scriptType) return unknown;

//   if (!Btc.btcSupportsCoin(coin)) return unknown;

//   if (!Btc.btcSupportsScriptType(coin, scriptType)) return unknown;

//   if (path.length !== 3 && path.length !== 5) return unknown;

//   if ((path[0] & 0x80000000) >>> 0 !== 0x80000000) return unknown;

//   const purpose = path[0] & 0x7fffffff;

//   if (![44, 49, 84].includes(purpose)) return unknown;

//   if (purpose === 44 && scriptType !== core.BTCInputScriptType.SpendAddress) return unknown;

//   if (purpose === 49 && scriptType !== core.BTCInputScriptType.SpendP2SHWitness) return unknown;

//   if (purpose === 84 && scriptType !== core.BTCInputScriptType.SpendWitness) return unknown;

//   const wholeAccount = path.length === 3;

//   const script = scriptType
//     ? (
//         {
//           [core.BTCInputScriptType.SpendAddress]: ["Legacy"],
//           [core.BTCInputScriptType.SpendP2SHWitness]: [],
//           [core.BTCInputScriptType.SpendWitness]: ["Segwit Native"],
//         } as Partial<Record<core.BTCInputScriptType, string[]>>
//       )[scriptType] ?? []
//     : [];

//   let isPrefork = false;
//   const slip44 = core.slip44ByCoin(coin);
//   if (slip44 === undefined) return unknown;
//   if (path[1] !== 0x80000000 + slip44) {
//     switch (coin) {
//       case "BitcoinCash":
//       case "BitcoinGold": {
//         if (path[1] === 0x80000000 + core.slip44ByCoin("Bitcoin")) {
//           isPrefork = true;
//           break;
//         }
//         return unknown;
//       }
//       case "BitcoinSV": {
//         if (
//           path[1] === 0x80000000 + core.slip44ByCoin("Bitcoin") ||
//           path[1] === 0x80000000 + core.slip44ByCoin("BitcoinCash")
//         ) {
//           isPrefork = true;
//           break;
//         }
//         return unknown;
//       }
//       default:
//         return unknown;
//     }
//   }

//   let attributes = isPrefork ? ["Prefork"] : [];
//   switch (coin) {
//     case "Bitcoin":
//     case "Litecoin":
//     case "BitcoinGold":
//     case "Testnet": {
//       attributes = attributes.concat(script);
//       break;
//     }
//     default:
//       break;
//   }

//   const attr = attributes.length ? ` (${attributes.join(", ")})` : "";

//   const accountIdx = path[2] & 0x7fffffff;

//   if (wholeAccount) {
//     return {
//       coin,
//       verbose: `${coin} Account #${accountIdx}${attr}`,
//       accountIdx,
//       wholeAccount: true,
//       isKnown: true,
//       scriptType,
//       isPrefork,
//     };
//   } else {
//     const change = path[3] === 1 ? "Change " : "";
//     const addressIdx = path[4];
//     return {
//       coin,
//       verbose: `${coin} Account #${accountIdx}, ${change}Address #${addressIdx}${attr}`,
//       accountIdx,
//       addressIdx,
//       wholeAccount: false,
//       isKnown: true,
//       isChange: path[3] === 1,
//       scriptType,
//       isPrefork,
//     };
//   }
// }

function describeCosmosPath(path: core.BIP32Path): core.PathDescription {
  const pathStr = core.addressNListToBIP32(path);
  const unknown: core.PathDescription = {
    verbose: pathStr,
    coin: "Atom",
    isKnown: false,
  };

  if (path.length != 5) {
    return unknown;
  }

  if (path[0] != 0x80000000 + 44) {
    return unknown;
  }

  if (path[1] != 0x80000000 + core.slip44ByCoin("Atom")) {
    return unknown;
  }

  if ((path[2] & 0x80000000) >>> 0 !== 0x80000000) {
    return unknown;
  }

  if (path[3] !== 0 || path[4] !== 0) {
    return unknown;
  }

  const index = path[2] & 0x7fffffff;
  return {
    verbose: `Cosmos Account #${index}`,
    accountIdx: index,
    wholeAccount: true,
    coin: "Atom",
    isKnown: true,
    isPrefork: false,
  };
}
/*
function describeThorchainPath(path: core.BIP32Path): core.PathDescription {
  const pathStr = core.addressNListToBIP32(path);
  const unknown: core.PathDescription = {
    verbose: pathStr,
    coin: "Rune",
    isKnown: false,
  };

  if (path.length != 5) {
    return unknown;
  }

  if (path[0] != 0x80000000 + 44) {
    return unknown;
  }

  if (path[1] != 0x80000000 + core.slip44ByCoin("Rune")) {
    return unknown;
  }

  if ((path[2] & 0x80000000) >>> 0 !== 0x80000000) {
    return unknown;
  }

  if (path[3] !== 0 || path[4] !== 0) {
    return unknown;
  }

  const index = path[2] & 0x7fffffff;
  return {
    verbose: `THORChain Account #${index}`,
    accountIdx: index,
    wholeAccount: true,
    coin: "Rune",
    isKnown: true,
    isPrefork: false,
  };
}
*/
function describeEosPath(path: core.BIP32Path): core.PathDescription {
  const pathStr = core.addressNListToBIP32(path);
  const unknown: core.PathDescription = {
    verbose: pathStr,
    coin: "Eos",
    isKnown: false,
  };

  if (path.length != 5) {
    return unknown;
  }

  if (path[0] != 0x80000000 + 44) {
    return unknown;
  }

  if (path[1] != 0x80000000 + core.slip44ByCoin("Eos")) {
    return unknown;
  }

  if ((path[2] & 0x80000000) >>> 0 !== 0x80000000) {
    return unknown;
  }

  if (path[3] !== 0 || path[4] !== 0) {
    return unknown;
  }

  const index = path[2] & 0x7fffffff;
  return {
    verbose: `Eos Account #${index}`,
    accountIdx: index,
    wholeAccount: true,
    coin: "Eos",
    isKnown: true,
    isPrefork: false,
  };
}

function describeRipplePath(path: core.BIP32Path): core.PathDescription {
  const pathStr = core.addressNListToBIP32(path);
  const unknown: core.PathDescription = {
    verbose: pathStr,
    coin: "Ripple",
    isKnown: false,
  };

  if (path.length != 5) {
    return unknown;
  }

  if (path[0] != 0x80000000 + 44) {
    return unknown;
  }

  if (path[1] != 0x80000000 + core.slip44ByCoin("Ripple")) {
    return unknown;
  }

  if ((path[2] & 0x80000000) >>> 0 !== 0x80000000) {
    return unknown;
  }

  if (path[3] !== 0 || path[4] !== 0) {
    return unknown;
  }

  const index = path[2] & 0x7fffffff;
  return {
    verbose: `Ripple Account #${index}`,
    accountIdx: index,
    wholeAccount: true,
    coin: "Ripple",
    isKnown: true,
    isPrefork: false,
  };
}

function describeBinancePath(path: core.BIP32Path): core.PathDescription {
  const pathStr = core.addressNListToBIP32(path);
  const unknown: core.PathDescription = {
    verbose: pathStr,
    coin: "Binance",
    isKnown: false,
  };

  if (path.length != 5) {
    return unknown;
  }

  if (path[0] != 0x80000000 + 44) {
    return unknown;
  }

  if (path[1] != 0x80000000 + core.slip44ByCoin("Binance")) {
    return unknown;
  }

  if ((path[2] & 0x80000000) >>> 0 !== 0x80000000) {
    return unknown;
  }

  if (path[3] !== 0 || path[4] !== 0) {
    return unknown;
  }

  const index = path[2] & 0x7fffffff;
  return {
    verbose: `Binance Account #${index}`,
    accountIdx: index,
    wholeAccount: true,
    coin: "Binance",
    isKnown: true,
    isPrefork: false,
  };
}
export class KeepKeyRestHDWallet implements core.HDWallet, core.BTCWallet, core.ETHWallet, core.DebugLinkWallet {
  readonly _supportsETHInfo = true;
  readonly _supportsBTCInfo = true;
  readonly _supportsCosmosInfo = true;
  readonly _supportsRippleInfo = true;
  readonly _supportsBinanceInfo = true;
  readonly _supportsEosInfo = true;
  readonly _supportsFioInfo = false;
  readonly _supportsDebugLink: boolean;
  readonly _isKeepKey = true;
  readonly _supportsETH = true;
  readonly _supportsEthSwitchChain = false;
  readonly _supportsAvalanche = false;
  readonly _supportsBTC = true;
  _supportsCosmos = true;
  _supportsRipple = true;
  _supportsBinance = true;
  _supportsEos = true;
  readonly _supportsFio = false;
  readonly _supportsThorchainInfo = true;
  readonly _supportsThorchain = true;
  readonly _supportsSecretInfo = false;
  readonly _supportsSecret = false;
  readonly _supportsKava = false;
  readonly _supportsKavaInfo = false;
  readonly _supportsTerra = false;
  readonly _supportsTerraInfo = false;

  features?: Messages.Features.AsObject;

  featuresCache?: Messages.Features.AsObject;

  defaultSdk: any;

  queueIpcEvent: any;

  cachedData: any = {};

  private async cached(prefix: string, key: any, fallback: () => any, forceUpdate?: boolean) {
    const cacheKey = `${prefix}${JSON.stringify(key)}`;
    const cachedData = this.cachedData[cacheKey];
    if (!cachedData || forceUpdate) this.cachedData[cacheKey] = await fallback();
    return this.cachedData[cacheKey];
  }

  constructor(sdk: any, queueIpcEvent: any) {
    this.queueIpcEvent = queueIpcEvent;
    this.defaultSdk = sdk;
    this._supportsDebugLink = false;
  }

  private async getSdk() {
    return this.defaultSdk;
  }

  public async getDeviceID(): Promise<string> {
    const features = await this.getFeatures(true);
    return features.deviceId;
  }

  public getVendor(): string {
    return "KeepKey";
  }

  public async getModel(): Promise<string> {
    const features = (await this.getFeatures(true)) as any;
    return core.mustBeDefined(features).model;
  }

  public async getFirmwareVersion(): Promise<string> {
    const features = (await this.getFeatures(true)) as any;

    return `v${features.majorVersion}.${features.minorVersion}.${features.patchVersion}`;
  }

  public async getLabel(): Promise<string> {
    const features = (await this.getFeatures(true)) as any;
    return features.label ?? "";
  }

  public async isInitialized(): Promise<boolean> {
    const features = (await this.getFeatures(true)) as any;
    return !!features.initialized;
  }

  public async isLocked(): Promise<boolean> {
    const features = (await this.getFeatures()) as any;
    if (features.pinProtection && !features.pinCached) return true;
    if (features.passphraseProtection && !features.passphraseCached) return true;
    return false;
  }

  public async getPublicKeys(getPublicKeys: Array<core.GetPublicKey>): Promise<Array<core.PublicKey | null>> {
    const sdk = await this.getSdk();
    const fallback = async () => await sdk.wallet.getPublicKeys({ getPublicKey: getPublicKeys });
    return this.cached("getPublicKeys", getPublicKeys, fallback);
  }

  public async ping(_msg: core.Ping): Promise<core.Pong> {
    throw new Error("not implemented");
  }

  public async reset(msg: core.ResetDevice): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.reset(msg as any);
  }

  public async recover(r: core.RecoverDevice): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.recovery.recover(r as any);
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

  public hasNativeShapeShift(_srcCoin: core.Coin, _dstCoin: core.Coin): boolean {
    return true;
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

  public async sendPin(pin: string): Promise<void> {
    this.queueIpcEvent("sendPin", pin);
  }

  public async sendPassphrase(passphrase: string): Promise<void> {
    const sdk = await this.getSdk();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await sdk.recovery.sendPassphrase({ passphrase });
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

  public async sendWord(word: string): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.recovery.sendWord({ body: word });
  }

  public async sendCharacterProto(character: string, _delete: boolean, _done: boolean): Promise<any> {
    const sdk = await this.getSdk();
    await sdk.recovery.sendCharacterProto({ sendCharacterProto: { character, _delete, done: _done } });
  }

  public async applyPolicy(p: Required<Types.PolicyType.AsObject>): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.applyPolicy({ body: p });
  }

  public async applySettings(s: Messages.ApplySettings.AsObject): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.applySettings({ body: s });
  }

  public async cancel(): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.cancel({ body: undefined });
  }

  public async changePin(): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.recovery.changePin({ body: undefined });
  }

  public async clearSession(): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.clearSession({ body: undefined });
  }

  public async firmwareErase(): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.firmwareErase({ body: undefined });
  }

  public async firmwareUpload(firmware: Buffer): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.firmwareUpload({ body: firmware });
  }

  public async initialize(): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.initialize({ body: {} });
  }

  public async getFeatures(cached = false): Promise<any> {
    const sdk = await this.getSdk();
    const fallback = async () => JSON.parse(await sdk.developer.getFeatures({ getFeatures: { cached } }));
    return this.cached("getFeatures", {}, fallback, !cached);
  }

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
    const sdk = await this.getSdk();
    await sdk.developer.loadDevice({ loadDevice: msg });
  }

  public async removePin(): Promise<void> {
    const sdk = await this.getSdk();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await sdk.developer.removePin({});
  }

  public async send(_events: core.Event[]): Promise<void> {
    throw new Error("not implemented");
  }

  public async softReset(): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.softReset({ body: undefined });
  }

  public async wipe(): Promise<void> {
    const sdk = await this.getSdk();
    await sdk.developer.wipe({ body: undefined });
  }

  public async btcSupportsCoin(_coin: core.Coin): Promise<boolean> {
    return true;
  }

  public async btcSupportsScriptType(_coin: core.Coin, _scriptType: core.BTCInputScriptType): Promise<boolean> {
    return true;
  }

  public async btcGetAddress(msg: core.BTCGetAddress): Promise<string> {
    const sdk = await this.getSdk();
    const fallback = async () => (await sdk.wallet.btcGetAddress({ bTCGetAddress: msg })).replace(/"/g, "");
    return this.cached("btcGetAddress", msg, fallback);
  }

  public async btcSignTx(msg: core.BTCSignTxKK): Promise<core.BTCSignedTx> {
    const sdk = await this.getSdk();
    const addressResponse = await sdk.sign.btcSignTx({ body: msg });
    return addressResponse;
  }

  public async btcSupportsSecureTransfer(): Promise<boolean> {
    return false;
  }

  public btcSupportsNativeShapeShift(): boolean {
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
    const sdk = await this.getSdk();
    const signedResponse = await sdk.sign.ethSignTx({ body: msg });
    return signedResponse;
  }

  // TODO check if sdk supports below messages

  public async ethGetAddress(msg: core.ETHGetAddress): Promise<string> {
    const sdk = await this.getSdk();
    const fallback = async () => (await sdk.wallet.ethGetAddress({ eTHGetAddress: msg })).replace(/"/g, "");
    return this.cached("ethGetAddress", msg, fallback);
  }

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

  public ethSupportsNativeShapeShift(): boolean {
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

  public async rippleGetAddress(msg: core.RippleGetAddress): Promise<string> {
    const sdk = await this.getSdk();
    const fallback = async () => (await sdk.wallet.rippleGetAddress({ rippleGetAddress: msg })).replace(/"/g, "");
    return this.cached("rippleGetAddress", msg, fallback);
  }

  public async rippleSignTx(msg: core.RippleSignTx): Promise<core.RippleSignedTx> {
    const sdk = await this.getSdk();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rippleSignTxResponse = await sdk.sign.rippleSignTx({ rippleSignTx: msg });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return rippleSignTxResponse;
  }

  public cosmosGetAccountPaths(msg: core.CosmosGetAccountPaths): Array<core.CosmosAccountPath> {
    return [
      {
        addressNList: [0x80000000 + 44, 0x80000000 + core.slip44ByCoin("Atom"), 0x80000000 + msg.accountIdx, 0, 0],
      },
    ];
  }

  public async cosmosGetAddress(msg: core.CosmosGetAddress): Promise<string> {
    const sdk = await this.getSdk();
    const fallback = async () => (await sdk.wallet.cosmosGetAddress({ cosmosGetAddress: msg })).replace(/"/g, "");
    return this.cached("cosmosGetAddress", msg, fallback);
  }

  public async cosmosSignTx(msg: core.CosmosSignTx): Promise<core.CosmosSignedTx> {
    const sdk = await this.getSdk();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return sdk.sign.cosmosSignTx({ cosmosSignTx: msg });
  }

  public thorchainGetAccountPaths(_msg: core.ThorchainGetAccountPaths): Array<core.ThorchainAccountPath> {
    throw new Error("not implemented");
  }

  public async thorchainGetAddress(msg: core.ThorchainGetAddress): Promise<string | null> {
    const sdk = await this.getSdk();
    const fallback = async () => (await sdk.wallet.thorchainGetAddress({ thorchainGetAddress: msg })).replace(/"/g, "");
    return this.cached("thorchainGetAddress", msg, fallback);
  }

  public async thorchainSignTx(msg: core.ThorchainSignTx): Promise<core.ThorchainSignedTx> {
    const sdk = await this.getSdk();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return sdk.sign.thorchainSignTx({ thorchainSignTx: msg });
  }

  public binanceGetAccountPaths(_msg: core.BinanceGetAccountPaths): Array<core.BinanceAccountPath> {
    throw new Error("not implemented");
  }

  public async binanceGetAddress(msg: core.BinanceGetAddress): Promise<string> {
    const sdk = await this.getSdk();
    const fallback = async () => (await sdk.wallet.binanceGetAddress({ binanceGetAddress: msg })).replace(/"/g, "");
    return this.cached("binanceGetAddress", msg, fallback);
  }

  public async binanceSignTx(msg: core.BinanceSignTx): Promise<core.BinanceSignedTx> {
    const sdk = await this.getSdk();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await sdk.sign.binanceSignTx({ body: msg });
  }

  public eosGetAccountPaths(msg: core.EosGetAccountPaths): Array<core.EosAccountPath> {
    return [
      {
        addressNList: [0x80000000 + 44, 0x80000000 + core.slip44ByCoin("Eos"), 0x80000000 + msg.accountIdx, 0, 0],
      },
    ];
  }

  public async eosGetPublicKey(msg: core.EosGetPublicKey): Promise<string> {
    const sdk = await this.getSdk();
    const fallback = async () => (await sdk.wallet.eosGetPublicKey({ eosGetPublicKey: msg })).replace(/"/g, "");
    return this.cached("eosGetPublicKey", msg, fallback);
  }

  public async eosSignTx(msg: core.EosToSignTx): Promise<core.EosTxSigned> {
    const sdk = await this.getSdk();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await sdk.sign.eosSignTx({ body: msg });
  }

  public describePath(msg: core.DescribePath): core.PathDescription {
    switch (msg.coin) {
      case "Ethereum":
        return describeETHPath(msg.path);
      case "Atom":
        return describeCosmosPath(msg.path);
      case "Binance":
        return describeBinancePath(msg.path);
      case "Ripple":
        return describeRipplePath(msg.path);
      case "Eos":
        return describeEosPath(msg.path);
      default:
        return describeUTXOPath(msg.path, msg.coin, msg.scriptType as BTCInputScriptType);
    }
  }

  public async disconnect(): Promise<void> {
    const sdk = await this.getSdk();
    sdk.developer.disconnect({ body: undefined });
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

export function info(): any {
  throw new Error("not implemented");
}

export function create(sdk: any, queueIpcEvent: any): KeepKeyRestHDWallet {
  return new KeepKeyRestHDWallet(sdk, queueIpcEvent);
}
