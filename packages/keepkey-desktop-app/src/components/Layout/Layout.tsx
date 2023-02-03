import type { ContainerProps } from '@chakra-ui/react'
import { Container } from '@chakra-ui/react'
import { ipcListeners } from 'electron-shim'
import { useWallet } from 'hooks/useWallet/useWallet'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'

import { BottomNav } from './Header/BottomNav'
import { Header } from './Header/Header'

export const Layout: React.FC<ContainerProps> = ({ children, ...rest }) => {
  const {
    state: { browserUrl },
  } = useWallet()
  const history = useHistory()

  const [hideHeader, setHideHeader] = useState(false)

  useEffect(() => {
    if (history.location.pathname !== '/browser' || !browserUrl) return
    const bUrl = new URL(browserUrl)
    ipcListeners.bridgeCheckAppPaired(bUrl.origin).then(setHideHeader)
  }, [history.location, browserUrl])
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 0%',
        }}
      >
        {hideHeader && <Header />}

        <Container
          as='main'
          maxWidth='full'
          width='full'
          marginInline='auto'
          paddingInlineStart='0'
          paddingInlineEnd='0'
          flex='1 1 0%'
          position={'relative'}
          paddingBottom={`env(safe-area-inset-top)`}
          {...rest}
        >
          {children}
        </Container>
      </div>
      <BottomNav />
    </div>
  )
}
