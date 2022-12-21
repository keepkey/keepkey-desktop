import * as core from '@shapeshiftoss/hdwallet-core'
import type LegacyWalletConnect from '@walletconnect/client'
import { Buffer } from 'buffer'
import type { EthChainData } from 'context/WalletProvider/web3byChainId'
import { web3ByChainId } from 'context/WalletProvider/web3byChainId'
import { ipcRenderer } from 'electron-shim'
import { logger } from 'lib/logger'
import type { TxData } from 'plugins/walletConnectToDapps/components/modal/callRequest/SendTransactionConfirmation'

const moduleLogger = logger.child({ namespace: ['WalletConnect', 'Service'] })

const addressNList = core.bip32ToAddressNList("m/44'/60'/0'/0/0")

type WCServiceOptions = {
  onCallRequest(request: any): void
}

export class LegacyWCService {
  constructor(
    private readonly wallet: core.ETHWallet,
    public readonly connector: LegacyWalletConnect,
    private readonly options?: WCServiceOptions,
  ) {}

  async connect() {
    if (!this.connector.connected) {
      await this.connector.createSession()
    }
    this.subscribeToEvents()
  }

  disconnect = async () => {
    await this.connector.killSession()
    this.connector.off('session_request')
    this.connector.off('connect')
    this.connector.off('call_request')
    this.connector.off('wallet_switchEthereumChain')
  }

  private subscribeToEvents() {
    this.connector.on('session_request', this._onSessionRequest.bind(this))
    this.connector.on('connect', this._onConnect.bind(this))
    this.connector.on('call_request', this._onCallRequest.bind(this))
    this.connector.on('wallet_switchEthereumChain', this._onSwitchChain.bind(this))
  }

  async _onSessionRequest(_: Error | null, payload: any) {
    const address = await this.wallet.ethGetAddress({ addressNList, showDisplay: false })
    if (address) {
      this.connector.approveSession({
        chainId: payload.params[0].chainId ?? 1,
        accounts: [address],
      })
    }
  }

  async _onConnect() {
    if (this.connector.connected && this.connector.peerMeta) {
      ipcRenderer.send('@walletconnect/pairing', {
        serviceName: this.connector.peerMeta.name,
        serviceImageUrl: this.connector.peerMeta.icons[0],
        serviceHomePage: this.connector.peerMeta.url,
      })
    }
  }

  async _onCallRequest(_: Error | null, payload: any) {
    this.options?.onCallRequest(payload)
  }

  async _onSwitchChain(_: Error | null, payload: any) {
    this.connector.approveRequest({
      id: payload.id,
      result: 'success',
    })
    const chainId = payload.params[0].chainId
    this.connector.updateSession({
      chainId,
      accounts: payload.params[0].accounts,
    })
    const web3Stuff = await web3ByChainId(parseInt(payload.params[0].chainId, 16))
    if (!web3Stuff) throw new Error('no data for chainId')
    this.connector.updateChain({
      chainId,
      networkId: chainId,
      rpcUrl: '',
      nativeCurrency: { name: web3Stuff.name, symbol: web3Stuff.symbol },
    })
  }

  public async doSwitchChain({ chain }: { chain: EthChainData }) {
    if (!chain) throw new Error('no data for chainId')
    this.connector.updateChain({
      chainId: chain.chainId,
      networkId: chain.chainId,
      rpcUrl: chain.providerUrl,
      nativeCurrency: { name: chain.name, symbol: chain.symbol },
    })
    this.connector.updateSession({
      chainId: chain.chainId,
      accounts: this.connector.accounts,
    })
  }

  public async approve(request: any, txData: TxData, web3: EthChainData) {
    if (request.method === 'personal_sign') {
      let message
      const strip0x = (inputHexString: string) =>
        inputHexString.startsWith('0x')
          ? inputHexString.slice(2, inputHexString.length)
          : inputHexString

      if (request.payload && request.payload.params[0])
        message = Buffer.from(strip0x(request.payload.params[0]), 'hex').toString('utf8')
      if (request.params && request.params[0])
        message = Buffer.from(strip0x(request.params[0]), 'hex').toString('utf8')

      if (!message) throw Error('failed to parse message!')

      const response = await this.wallet.ethSignMessage({
        ...txData,
        addressNList,
        message,
      })
      const result = response?.signature
      this.connector.approveRequest({ id: request.id, result })
    } else if (request.method === 'eth_sendTransaction') {
      const sendData: any = {
        addressNList,
        chainId: this.connector.chainId,
        data: txData.data,
        gasLimit: txData.gasLimit,
        to: txData.to,
        value: txData.value ?? '0x0',
        nonce: txData.nonce,
        maxPriorityFeePerGas: txData.maxPriorityFeePerGas,
        maxFeePerGas: txData.maxFeePerGas,
      }

      // if gasPrice was passed in it means we couldnt get maxPriorityFeePerGas & maxFeePerGas
      if (txData.gasPrice) {
        sendData['gasPrice'] = txData.gasPrice
        delete sendData.maxPriorityFeePerGas
        delete sendData.maxFeePerGas
      }

      const signedData = await this.wallet.ethSignTx?.(sendData)

      await web3.web3.eth.sendSignedTransaction(signedData?.serialized ?? '')
      const txid = web3.web3.utils.sha3(signedData?.serialized)

      this.connector.approveRequest({ id: request.id, result: txid })
    } else if (request.method === 'eth_signTransaction') {
      const response = await this.wallet.ethSignTx({
        addressNList,
        chainId: this.connector.chainId,
        data: txData.data,
        gasLimit: txData.gasLimit,
        nonce: txData.nonce,
        to: txData.to,
        value: txData.value,
      })
      const result = response?.serialized
      this.connector.approveRequest({ id: request.id, result })
    } else if (request.method === 'eth_signTypedData') {
      if (!this.wallet) throw Error('wallet not init!')
      if (!this.wallet.ethSignTypedData) throw Error('wallet not latest version ethSignTypedData!')
      // TODO: verify param[0] matches given address

      const response = await this.wallet.ethSignTypedData({
        addressNList,
        typedData: JSON.parse(request.params[1]),
      })
      moduleLogger.info(response, 'response')
      //res?.signature
      //res?.address
      //res?.domainSeparatorHash
      //res?.messageHash
      this.connector.approveRequest({
        id: request.id,
        result: response?.signature,
      })
    } else {
      console.error('Method Not Supported! e: ', request.method)
      const message = 'JSON RPC method not supported'
      this.connector.rejectRequest({ id: request.id, error: { message } })
    }
  }

  private convertHexToUtf8IfPossible(hex: string) {
    try {
      return Buffer.from(hex, 'hex').toString('utf8')
    } catch (e) {
      return hex
    }
  }
}
