import * as core from '@keepkey/hdwallet-core'
import type WalletConnect from '@walletconnect/client'
import { convertHexToUtf8 } from '@walletconnect/utils'
import { ipcRenderer } from 'electron'
import type { TxData } from 'plugins/walletConnectToDapps/components/modal/callRequest/SendTransactionConfirmation'
import { web3ByChainId } from 'context/WalletProvider/web3byChainId'
import { logger } from 'lib/logger'
const moduleLogger = logger.child({ namespace: ['WC-service'] })
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
    moduleLogger.debug("Connect Called")
    if (!this.connector.connected) {
      await this.connector.createSession()
    }
    this.subscribeToEvents()
  }

  disconnect = async () => {
    moduleLogger.debug("disconnect Called")
    await this.connector.killSession()
    this.connector.off('session_request')
    this.connector.off('connect')
    this.connector.off('call_request')
    this.connector.off('wallet_switchEthereumChain')
  }

  private subscribeToEvents() {
    moduleLogger.debug(" subscribeToEvents: ")
    this.connector.on('session_request', this._onSessionRequest.bind(this))
    this.connector.on('connect', this._onConnect.bind(this))
    this.connector.on('call_request', this._onCallRequest.bind(this))
    this.connector.on('wallet_switchEthereumChain', this._onSwitchChain.bind(this))
  }

  async _onSessionRequest(_: Error | null, payload: any) {
    moduleLogger.debug(" _onSessionRequest: ")
    const address = await this.wallet.ethGetAddress({ addressNList, showDisplay: false })
    if (address) {
      this.connector.approveSession({
        chainId: payload.params[0].chainId ?? 1,
        accounts: [address],
      })
    }
  }

  async _onConnect() {
    moduleLogger.debug(" _onConnect: ")
    if (this.connector.connected && this.connector.peerMeta) {
      moduleLogger.debug(" peerMeta: ")
      ipcRenderer.send('@walletconnect/pairing', {
        serviceName: this.connector.peerMeta.name,
        serviceImageUrl: this.connector.peerMeta.icons[0],
        serviceHomePage: this.connector.peerMeta.url,
      })
    }
  }

  async _onCallRequest(_: Error | null, payload: any) {
    moduleLogger.debug(" _onCallRequest: ",payload)
    this.options?.onCallRequest(payload)
  }

  async _onSwitchChain(_: Error | null, payload: any) {
    moduleLogger.debug(" _onSwitchChain: ",payload)
    this.connector.approveRequest({
      id: payload.id,
      result: 'success',
    })
    this.connector.updateSession({
      chainId: payload.params[0].chainId,
      accounts: payload.params[0].accounts,
    })
    this.connector.updateChain({chainId: payload.params[0].chainId, networkId: payload.params[0].chainId, rpcUrl: '', nativeCurrency: { name: 'blah', symbol: 'blah'}})
  }

  public doSwitchChain({chainId}: {chainId: number}) {
    // @ts-ignore
    moduleLogger.debug(" doSwitchChain: ", {chainId})
    const web3Stuff = web3ByChainId(chainId)
    if(!web3Stuff) throw new Error('no data for chainId')
    console.log('doing dwitch chain!!!!')
    this.connector.updateChain({chainId, networkId: chainId, rpcUrl: web3Stuff.providerUrl, nativeCurrency: { name: web3Stuff.name, symbol: web3Stuff.symbol}})
    this.connector.updateSession({
      chainId,
      accounts: this.connector.accounts,
    })
  }

  public async approve(request: any, txData: TxData) {
    // @ts-ignore
    moduleLogger.debug(" approve: ", {request,txData})

    if (request.method === 'personal_sign' || request.method === 'eth_sign') {
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
      // @ts-ignore
      moduleLogger.info(" sendData: ", {sendData})

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
    } if (request.method === 'eth_signTypedData') {
      if(!this.wallet) throw Error("wallet not init!")
      if(!this.wallet.ethSignTypedData) throw Error("wallet not latest version ethSignTypedData!")
      const response = await this.wallet.ethSignTypedData({
        addressNList,
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        domain: {
          name: "USD Coin",
          version: "2",
          verifyingContract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          chainId: 1,
        },
        primaryType: "Permit",
        message: {
          owner: "0x33b35c665496bA8E71B22373843376740401F106",
          spender: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
          value: "4023865",
          nonce: 0,
          deadline: 1655431026,
        },
      })
      // @ts-ignore
      moduleLogger.error("response: ",response)
      //res?.signature
      //res?.address
      //res?.domainSeparatorHash
      //res?.messageHash
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
