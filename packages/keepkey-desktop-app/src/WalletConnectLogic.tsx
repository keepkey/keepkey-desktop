import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import { createWallectConnectWeb3Wallet } from 'kkdesktop/walletconnect/utils'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useEffect } from 'react'

export const WalletConnectLogic = () => {
  const { addProposal, addRequest, onDisconnect } = useWalletConnect()
  useEffect(() => {
    createWallectConnectWeb3Wallet().then(client => {
      client.on('session_proposal', addProposal)
      client.on('session_request', req => {
        switch (req.params.request.method) {
          case 'wallet_addEthereumChain':
            const response = formatJsonRpcResult(req.id, true)
            client.respondSessionRequest({
              topic: req.topic,
              response,
            })
            break

          default:
            addRequest(req)
            break
        }
      })
      client.on('session_delete', onDisconnect)
      client.on('auth_request', data => {
        console.log('AUTH REQUEST', data)
      })
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <></>
}
