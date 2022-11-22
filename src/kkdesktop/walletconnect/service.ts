import * as core from '@keepkey/hdwallet-core'
import type WalletConnect from '@walletconnect/client'
import { convertHexToUtf8 } from '@walletconnect/utils'
import { ipcRenderer } from 'electron'
import type { TxData } from 'plugins/walletConnectToDapps/components/modal/callRequest/SendTransactionConfirmation'
import { web3ByChainId } from 'context/WalletProvider/web3byChainId'

const addressNList = core.bip32ToAddressNList("m/44'/60'/0'/0/0")

type WCServiceOptions = {
  onCallRequest(request: any): void
}

export class WCService {
  constructor(
    private readonly wallet: core.ETHWallet,
    public readonly connector: WalletConnect,
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
    this.connector.updateSession({
      chainId: payload.params[0].chainId,
      accounts: payload.params[0].accounts,
    })
  }

  public async approve(request: any, txData: TxData) {
    if (request.method === 'personal_sign') {
      const response = await this.wallet.ethSignMessage({
        ...txData,
        addressNList,
        message: this.convertHexToUtf8IfPossible(request.params[0]),
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

      const chainWeb3 = web3ByChainId(this.connector.chainId) as any
      await chainWeb3.web3.eth.sendSignedTransaction(signedData?.serialized)
      const txid = await chainWeb3.web3.utils.sha3(signedData?.serialized)

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
    } else {
      const message = 'JSON RPC method not supported'
      this.connector.rejectRequest({ id: request.id, error: { message } })
    }
  }

  private convertHexToUtf8IfPossible(hex: string) {
    try {
      return convertHexToUtf8(hex)
    } catch (e) {
      return hex
    }
  }
}
