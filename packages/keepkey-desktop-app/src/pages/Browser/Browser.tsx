/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArrowForwardIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  RepeatIcon,
} from '@chakra-ui/icons'
import {
  Avatar,
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  HStack,
  IconButton,
  IconButton,
  Input,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import * as Comlink from 'comlink'
import { Main } from 'components/Layout/Main'
import { getConfig } from 'config'
import { ipcListeners } from 'electron-shim'
// import { WalletActions } from 'context/WalletProvider/actions'
import { useWallet } from 'hooks/useWallet/useWallet'
import React, { useCallback, useEffect, useState } from 'react'
import { FaBug } from 'react-icons/fa'

const getWebview = () => document.getElementById('webview') as Electron.WebviewTag | null
const getWebviewWc = () =>
  document.getElementById('second-webview-top') as Electron.WebviewTag | null

const goBack = () => {
  const webview = getWebview()
  if (!webview) return
  if (webview.canGoBack()) webview.goBack()
}

const goForward = () => {
  const webview = getWebview()
  if (!webview) return
  if (webview.canGoForward()) webview.goForward()
}

const openDevTools = () => {
  const webview = getWebview()
  if (!webview) return
  webview.openDevTools()
}

const stopLoading = () => {
  const webview = getWebview()
  if (!webview) return
  webview.stop()
}

const formatUrl = (inputUrl: string) => {
  try {
    return new URL(inputUrl).toString()
  } catch { }
  try {
    return new URL(`https://${inputUrl}`).toString()
  } catch { }
  return undefined
}

const clearClipBoardIfWCString = async () => {
  try {
    const clipboardData = await navigator.clipboard.read()
    const link = await clipboardData[0].getType('text/plain')
    const clipboardUri = decodeURIComponent(await link.text())

    if (clipboardUri.includes('wc:')) {
      await navigator.clipboard.writeText('')
    }
  } catch (e) {
    console.error(e)
  }
}

const checkIfSSDApp = (currentUrl: string) => {
  const url = new URL(currentUrl)
  const kkDesktopApiKey = localStorage.getItem('@app/serviceKey')
  const webview = getWebview()

  if (
    url.origin === getConfig().REACT_APP_SHAPESHIFT_DAPP_URL ||
    url.origin === 'http://localhost:3000'
  ) {
    if (!webview) return

    webview
      .executeJavaScript('localStorage.getItem("localWalletType");', true)
      .then((savedWalletType: any) => {
        if (!savedWalletType || savedWalletType === 'keepkey') {
          const localWalletDeviceId = localStorage.getItem('localWalletDeviceId')
          webview
            .executeJavaScript('localStorage.getItem("localWalletDeviceId");', true)
            .then((savedWalletId: any) => {
              if (!savedWalletId || savedWalletId !== localWalletDeviceId) {
                if (!kkDesktopApiKey || !localWalletDeviceId) return

                ipcListeners.getSSAutoLogin(localWalletDeviceId, kkDesktopApiKey).then(
<<<<<<< HEAD
                  injection => {
=======
                    (injection: any) => {
>>>>>>> c3b527bb6ace50901852912e58793eeb2a4e7797
                    console.log('INJECTION', injection)
                    webview.executeJavaScript(injection)
                  },
                  // .then(() => webview.reload())
                )
              }
            })
        }
      })
      .catch(console.error)
  }
}

export const Browser = () => {
  const [url, setUrl] = useState('https://private.shapeshift.com/')
  const [urlWc, setUrlWc] = useState('https://wallet-connect-dapp-ochre.vercel.app')
  const [inputUrl, setInputUrl] = useState(url)
  const [loading, setLoading] = useState(false)
  const [loadingWc, setLoadingWc] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: false, // Explicitly set the default state to closed
  })
  const [webviewLoadFailure, setWebviewLoadFailure] = useState<string | undefined>(undefined)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [forceLoad, setForceLoad] = useState(false)
  const {
    dispatch,
    state: { browserUrl, walletConnectUri, walletConnectOpen },
  } = useWallet()

  const [webviewReady, setWebviewReady] = useState(false)
  const [webviewWcReady, setWebviewWcReady] = useState(false)

  useEffect(() => {
    const setupListeners = () => {
      const webview = getWebview()
      if (!webview) {
        console.error('Webview not available')
        return
      }

      const listener = () => {
        const currentUrl = webview.getURL()
        const urlParams = new URL(currentUrl).searchParams
        const walletConnect = urlParams.get('walletconnect')
        console.log('URL changed to:', currentUrl) // Debug: Log current URL
        console.log('walletconnect parameter:', walletConnect) // Debug: Log walletconnect param
      }

      webview.addEventListener('did-stop-loading', listener)
      return () => {
        webview.removeEventListener('did-stop-loading', listener)
      }
    }

    setupListeners()

    const setupListenersWc = () => {
      const webviewWc = getWebviewWc()
      if (!webviewWc) {
        console.error('Webview not available')
        return
      }

      const listener = () => {
        const currentUrl = webviewWc.getURL()
        const urlParams = new URL(currentUrl).searchParams
        const walletConnect = urlParams.get('walletconnect')
        console.log('WC URL changed to:', currentUrl) // Debug: Log current URL
        console.log('walletconnect parameter:', walletConnect) // Debug: Log walletconnect param
      }

      webviewWc.addEventListener('did-stop-loading', listener)
      return () => {
        webviewWc.removeEventListener('did-stop-loading', listener)
      }
    }

    setupListenersWc()
  }, [onOpen, onClose]) // Include dependencies if they change over time

  useEffect(() => {
    clearClipBoardIfWCString()
    const webview = getWebview()!
    const listener = () => {
      setWebviewReady(true)
      const sdkApiKey = localStorage.getItem('@app/serviceKey')
      if (!sdkApiKey) return
      webview.executeJavaScript(`localStorage.setItem(
        'WCM_RECENT_WALLET_DATA',
        '{"id": "fdcaaa47c154988ff2ce28d39248eb10366ec60c7de725f73b0d33b5bb9b9a64","name": "KeepKey Desktop","homepage": "https://www.keepkey.com/","image_id": "eb4227d9-366c-466c-db8f-ab7e45985500","order": 5690,"desktop": {"native": "keepkey://launch","universal": ""}}')`)
    }
    webview.addEventListener('dom-ready', listener)
    return () => {
      webview.removeEventListener('dom-ready', listener)
    }
  }, [])

  useEffect(() => {
    const webview = getWebviewWc()!
    const listener = () => {
      setWebviewWcReady(true)
      ipcListeners.then((injection: any) => webview.executeJavaScript(injection))
    }
    webview.addEventListener('dom-ready', listener)
    return () => {
      webview.removeEventListener('dom-ready', listener)
    }
  }, [])

  useEffect(() => {
    const webview = getWebview()!
    const listener = () => {
      setLoading(true)
      setWebviewLoadFailure(undefined)
    }
    webview.addEventListener('did-start-loading', listener)
    return () => {
      webview.removeEventListener('did-start-loading', listener)
    }
  }, [])

  useEffect(() => {
    const webview = getWebview()!
    const listener = () => {
      const webview = getWebview()!
      const currentUrl = webview.getURL()
      setUrl(currentUrl)
      setInputUrl(currentUrl)
      setCanGoBack(webview.canGoBack())
      setCanGoForward(webview.canGoForward())
      setLoading(false)
    }
    webview.addEventListener('did-stop-loading', listener)
    return () => {
      webview.removeEventListener('did-stop-loading', listener)
    }
  }, [])

  useEffect(() => {
    const webview = getWebviewWc()!
    const listener = () => {
      const webview = getWebviewWc()!
      const currentUrl = webview.getURL()
      setUrlWc(currentUrl)
      // setCanGoBack(webview.canGoBack())
      // setCanGoForward(webview.canGoForward())
      setLoadingWc(false)
    }
    webview.addEventListener('did-stop-loading', listener)
    return () => {
      webview.removeEventListener('did-stop-loading', listener)
    }
  }, [])

  useEffect(() => {
    const webview = getWebview()!
    const listener = (e: Electron.DidFailLoadEvent) => {
      setWebviewLoadFailure(e.errorDescription)
    }
    webview.addEventListener('did-fail-load', listener)
    return () => {
      webview.removeEventListener('did-fail-load', listener)
    }
  }, [])

  useEffect(() => {
    const webview = getWebview()!
    const listener = () => {
      const url = webview.getURL()
      if (url === 'about:blank') return
      //dispatch({ type: WalletActions.SET_BROWSER_URL, payload: url })
      checkIfSSDApp(url)
    }
    webview.addEventListener('did-finish-load', listener)
    return () => {
      webview.removeEventListener('did-finish-load', listener)
    }
  }, [dispatch])

  useEffect(() => {
    const webview = getWebview()!
    if (webviewReady && (url !== webview.getURL() || forceLoad)) {
      setForceLoad(false)
      webview.loadURL(url)
    }
  }, [webviewReady, url, forceLoad])

  const formatAndSaveUrl = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.preventDefault()
      const newUrl = formatUrl(inputUrl) ?? url
      setInputUrl(newUrl)
      setUrl(newUrl)
      setForceLoad(true)
    },
    [inputUrl, url],
  )

  useEffect(() => {
    if (webviewWcReady && walletConnectUri) {
      const newUrl = `https://wallet-connect-dapp-ochre.vercel.app/wc?uri=${encodeURIComponent(
        walletConnectUri,
      )}`
      const webviewWc = getWebviewWc()
      webviewWc?.loadURL(newUrl)
    }
  }, [walletConnectUri, webviewReady])

  useEffect(() => {
    if (!webviewReady) return
    if (!browserUrl) return
    const newUrl = formatUrl(browserUrl)

    if (newUrl) {
      console.log('browserUrl', browserUrl)
      setInputUrl(newUrl)
      setUrl(newUrl)
    } else {
      console.error('invalid browserUrl', browserUrl)
    }
  }, [browserUrl, webviewReady])

  useEffect(() => {
    if (!webviewWcReady) return
    if (!walletConnectUri) return

    if (walletConnectUri) {
      if (!isOpen) {
        onOpen()
      }
      console.log('walletConnectUri', walletConnectUri)
      //src='https://wallet-connect-dapp-ochre.vercel.app/'
      if (walletConnectUri) {
        setUrlWc('https://wallet-connect-dapp-ochre.vercel.app/wc?=' + walletConnectUri)
      } else {
        setUrlWc('https://wallet-connect-dapp-ochre.vercel.app')
      }
    } else {
      console.error('invalid browserUrl', browserUrl)
    }
  }, [walletConnectUri, webviewWcReady])

  //walletConnectOpen
  useEffect(() => {
    console.log('walletConnectOpen: ', walletConnectOpen)
    if (walletConnectOpen) {
      onOpen()
    } else {
      onClose()
    }
  }, [walletConnectOpen])

  // Add a button to manually toggle the drawer for debugging
  // const toggleSecondWebview = () => {
  //     if (isOpen) {
  //         onClose();
  //     } else {
  //         onOpen();
  //     }
  // };

  useEffect(() => {
    if (!webviewReady) return

    const webview = getWebview()!
    const contentsId = webview.getWebContentsId()
    const loadURL = webview.loadURL.bind(webview)
    ipcListeners
      .webviewAttachOpenHandler(contentsId, Comlink.proxy(loadURL))
      .catch((e: any) => console.error('webviewAttachOpenHandler error:', e))
  }, [webviewReady])

  useEffect(() => {
    if (!webviewWcReady) return

    const webviewWc = getWebviewWc()!
    const contentsId = webviewWc.getWebContentsId()
    const loadURL = webviewWc.loadURL.bind(webviewWc)
    ipcListeners
      .webviewAttachOpenHandler(contentsId, Comlink.proxy(loadURL))
      .catch((e: any) => console.error('webviewAttachOpenHandler error:', e))
  }, [webviewWcReady])

  return (
    <Main
      height='full'
      style={{
        padding: 0,
        minWidth: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction={{ base: 'column', md: 'column' }} height='full' style={{ margin: '5px' }}>
        <form onSubmit={formatAndSaveUrl}>
          <HStack>
            <Input
              disabled={loading}
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onBlur={formatAndSaveUrl}
            />
            {loading ? (
              <IconButton aria-label='Stop' icon={<CloseIcon />} onClick={stopLoading} />
            ) : url === inputUrl && webviewLoadFailure === undefined ? (
              <IconButton aria-label='Reload' icon={<RepeatIcon />} type='submit' />
            ) : (
              <IconButton aria-label='Go' icon={<ArrowForwardIcon />} type='submit' />
            )}
            <IconButton
              aria-label='Back'
              icon={<ArrowLeftIcon />}
              onClick={goBack}
              isLoading={loading}
              isDisabled={!canGoBack}
            />
            <IconButton
              aria-label='Forward'
              icon={<ArrowRightIcon />}
              onClick={goForward}
              isLoading={loading}
              isDisabled={!canGoForward}
            />
            <IconButton aria-label='Open developer tools' icon={<FaBug />} onClick={openDevTools} />
          </HStack>
        </form>
      </Stack>
      <Stack direction='row' flex={1}>
        <webview
          id='webview'
          partition='browser'
          src='about:blank'
          style={{ flexGrow: 8 }}
          allowpopups='true'
        ></webview>
        <Stack flex={4} display={isOpen ? 'flex' : 'none'}>
          <webview
            id='second-webview-top'
            src={webviewWcReady ? `https://wallet-connect-dapp-ochre.vercel.app` : 'about:blank'}
            style={{ flex: 4 }}
          ></webview>
        </Stack>
      </Stack>
    </Main>
  )
}
