/// <reference types="electron" />

import {
  ArrowForwardIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  RepeatIcon,
} from '@chakra-ui/icons'
import { Alert, AlertIcon, HStack, IconButton, Input, Stack } from '@chakra-ui/react'
import * as Comlink from 'comlink'
import { Main } from 'components/Layout/Main'
import { ipcListeners } from 'electron-shim'
// import { WalletActions } from 'context/WalletProvider/actions'
import { useWallet } from 'hooks/useWallet/useWallet'
import React, { useCallback, useEffect, useState } from 'react'
import { FaBug } from 'react-icons/fa'

const getWebview = () => document.getElementById('webview') as Electron.WebviewTag | null

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
  } catch {}
  try {
    return new URL(`https://${inputUrl}`).toString()
  } catch {}
  return undefined
}

const clearClipBoardIfWCString = async () => {
  try {
    const clipboardData = await navigator.clipboard.read()
    const link = await clipboardData[0].getType('text/plain')
    const clipboardUri = await link.text()
    if (clipboardUri.startsWith('wc:')) {
      await navigator.clipboard.writeText('')
    }
  } catch (e) {
    console.error(e)
  }
}

export const Browser = () => {
  const [url, setUrl] = useState(
    'about:blank'
  )
  const [inputUrl, setInputUrl] = useState(url)
  const [loading, setLoading] = useState(false)
  const [webviewLoadFailure, setWebviewLoadFailure] = useState<string | undefined>(undefined)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [forceLoad, setForceLoad] = useState(false)
  const {
    dispatch,
    state: { browserUrl },
  } = useWallet()

  const [webviewReady, setWebviewReady] = useState(false)
  useEffect(() => {
    clearClipBoardIfWCString()
    const webview = getWebview()!
    const listener = () => setWebviewReady(true)
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
      // dispatch({ type: WalletActions.SET_BROWSER_URL, payload: webview.getURL() })
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

  // useEffect(() => {
  //   if (!webviewReady) return

  //   const contentsId = getWebview()!.getWebContentsId()
  //   const abortController = new AbortController()
  //   const callback = _.memoize(async (data: string) => {
  //     if (!data.startsWith('wc:')) return
  //     console.log(`got scanned code, connecting to ${data}`)
  //     await connectIndirect('')
  //     await connectIndirect(data)
  //   })

  //   ipcListeners
  //     .appMonitorWebContentsForQr(contentsId, abortController.signal, Comlink.proxy(callback))
  //     .catch(e => console.error('appMonitorWebContentsForQr error:', e))

  //   return () => abortController.abort()
  // }, [webviewReady])

  // useEffect(() => {
  //   connectIndirect = connect
  // }, [connect])

  useEffect(() => {
    if (!webviewReady) return

    const webview = getWebview()!
    const contentsId = webview.getWebContentsId()
    const loadURL = webview.loadURL.bind(webview)
    ipcListeners
      .webviewAttachOpenHandler(contentsId, Comlink.proxy(loadURL))
      .catch(e => console.error('webviewAttachOpenHandler error:', e))
  }, [webviewReady])

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
      <webview
        id='webview'
        // partition='browser'
        src='https://web-theta-one.vercel.app/#/connect-wallet?returnUrl=/dashboard'
        style={{
          flexGrow: 1,
        }}
        // @ts-expect-error
        allowpopups='true'
      ></webview>
      <Stack direction={{ base: 'column', md: 'column' }} height='full' style={{ margin: '5px' }}>
        {webviewLoadFailure !== undefined && (
          <Alert status='error'>
            <AlertIcon />
            {webviewLoadFailure}
          </Alert>
        )}
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
    </Main>
  )
}
