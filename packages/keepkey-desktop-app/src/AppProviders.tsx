// @ts-nocheck
import {
  ChakraProvider,
  ColorModeScript,
  createLocalStorageManager,
  createStandaloneToast,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { AppProvider } from 'context/AppProvider/AppContext'
import { BrowserRouterProvider } from 'context/BrowserRouterProvider/BrowserRouterProvider'
import { I18nProvider } from 'context/I18nProvider/I18nProvider'
import { ModalProvider } from 'context/ModalProvider/ModalProvider'
import { KeepKeyProvider } from 'context/WalletProvider/KeepKeyProvider'
import { WalletProvider } from 'context/WalletProvider/WalletProvider'
import React from 'react'
import { HashRouter } from 'react-router-dom'
import { ScrollToTop } from 'Routes/ScrollToTop'
import { theme } from 'theme/theme'

type ProvidersProps = {
  children: React.ReactNode
}

const manager = createLocalStorageManager('ss-theme')

const LoadingComponent = () => (
  <Center height="100vh">
    <Spinner size="xl" />
  </Center>
)

export function AppProviders({ children }: ProvidersProps) {
  const { ToastContainer } = createStandaloneToast()
  return (
    <>
      <ColorModeScript storageKey='ss-theme' />
      <ChakraProvider theme={theme} colorModeManager={manager} cssVarsRoot='body'>
        <ToastContainer />
        <HashRouter basename='/'>
          <ScrollToTop />
          <BrowserRouterProvider>
            <I18nProvider>
              <WalletProvider>
                <KeepKeyProvider>
                  <ModalProvider>
                    <AppProvider>{children}</AppProvider>
                  </ModalProvider>
                </KeepKeyProvider>
              </WalletProvider>
            </I18nProvider>
          </BrowserRouterProvider>
        </HashRouter>
      </ChakraProvider>
    </>
  )
}
