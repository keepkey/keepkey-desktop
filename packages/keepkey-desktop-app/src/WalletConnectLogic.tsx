import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import { createSignClient } from 'kkdesktop/walletconnect/utils'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useEffect } from 'react'

export const WalletConnectLogic = () => {
  const { addProposal, addRequest, onDisconnect } = useWalletConnect()
  useEffect(() => {
    createSignClient().then(client => {
      client.on('session_proposal', addProposal)
      client.on('session_request', req => {
        switch (req.params.request.method) {
          case 'wallet_addEthereumChain':
            const response = formatJsonRpcResult(req.id, true)
            client.respond({
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
      client.on('session_expire', onDisconnect)
      client.on('session_event', data => {
        console.log('session_event', data)
      })
      client.on('session_update', console.log)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <></>
}
