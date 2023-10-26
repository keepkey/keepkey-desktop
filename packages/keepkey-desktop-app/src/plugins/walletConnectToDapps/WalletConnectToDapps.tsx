import { Container, Stack } from '@chakra-ui/react'
// @ts-expect-error
// import Client from '@pioneer-platform/pioneer-client'
// import { getConfig } from 'config'
import type { FC } from 'react'
// import { WalletActions } from 'context/WalletProvider/actions'
// import { ExplorationBanner } from './components/ExplorationBanner'
// import { useEffect, useState } from 'react'

// import { useWallet } from '../../hooks/useWallet/useWallet'
import { DappRegistryGrid } from './components/DappRegistryGrid'
// import { useHistory } from 'react-router'
// import type { RegistryItem } from './types'

export const WalletConnectToDapps: FC = () => {
  // const [motd, setSetMotd] = useState('')
  // const { dispatch } = useWallet()
  // const history = useHistory()
  //get MOTD
  // let updateMotd = async function () {
  //   try {
  //     let spec = getConfig().REACT_APP_DAPP_URL
  //     let config = { queryKey: 'key:public', spec }
  //     let Api = new Client(spec, config)
  //     let api = await Api.init()
  //     let info = await api.Globals()
  //     //setSetMotd(info.data.motd)
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }
  //
  // useEffect(() => {
  //   updateMotd()
  // }, [])

  return (
    <Container p={4} maxW='container.lg'>
      <Stack spacing={10}>
        {/*<Alert status='info'>*/}
        {/*  <AlertIcon />*/}
        {/*  {motd}*/}
        {/*</Alert>*/}
        <DappRegistryGrid />
      </Stack>
    </Container>
  )
}
