import { createSignClient } from 'kkdesktop/walletconnect/utils'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useEffect } from 'react'

export const WalletConnectLogic = () => {
  const { addProposal, addRequest } = useWalletConnect()
  useEffect(() => {
    createSignClient().then(client => {
      client.on('session_proposal', addProposal)
      client.on('session_request', addRequest)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <></>
}
