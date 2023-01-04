import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { Alert, AlertIcon, Button, HStack, IconButton, Input, Stack } from '@chakra-ui/react'
import { Card } from 'components/Card/Card'
import { Main } from 'components/Layout/Main'
import { WalletActions } from 'context/WalletProvider/actions'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useEffect, useState } from 'react'
import { FaBug } from 'react-icons/fa'

export const Browser = () => {
  const [url, setUrl] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [failedToLoad, setFailedToLoad] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const {
    dispatch,
    state: { browserUrl },
  } = useWallet()

  const formatAndSaveUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('https')) return setInputUrl(url)
    setInputUrl(`https://${url}`)
  }

  useEffect(() => {
    const webview: any = document.getElementById('webview')
    if (!webview) return
    webview.setAttribute('autosize', 'on')
    webview.setAttribute('allowpopups', 'true')
    setHasMounted(true)
    webview.addEventListener('did-start-loading', () => {
      setLoading(true)
      setFailedToLoad(false)
    })
    webview.addEventListener('did-stop-loading', () => {
      const webviewUrl = webview.getURL()
      setInputUrl(webviewUrl)
      setLoading(false)
      setFailedToLoad(false)
      dispatch({ type: WalletActions.SET_BROWSER_URL, payload: webviewUrl })
    })
    // electron webview doesn't allow listening for onClick
    // webview.addEventListener('click', () => {
    //   console.log('webview click')
    //   navigator.clipboard.read().then(async data => {
    //     console.log('clipboard data', data)
    //     const link = await data[0].getType('text/plain')
    //     link.text().then(uri => {
    //       if (uri.startsWith('wc:')) {
    //         connect(uri)
    //       }
    //     })
    //   })
    // })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!browserUrl || !hasMounted) return
    if (browserUrl === inputUrl) return
    setUrl(browserUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserUrl, hasMounted])

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(currentLoading => {
          if (currentLoading) {
            setFailedToLoad(true)
            dispatch({ type: WalletActions.SET_BROWSER_URL, payload: null })
            return false
          }
          return currentLoading
        })
      }, 10000)
    }
  }, [dispatch, loading])

  const loadUrl = (e: any) => {
    e.preventDefault()
    setLoading(true)
    setUrl(inputUrl)
  }

  const goBack = () => {
    const webview: any = document.getElementById('webview')
    if (!webview) return
    if (webview.canGoBack()) webview.goBack()
  }

  const goForward = () => {
    const webview: any = document.getElementById('webview')
    if (!webview) return
    if (webview.canGoForward()) webview.goForward()
  }

  const openDevTools = () => {
    const webview: any = document.getElementById('webview')
    if (!webview) return
    webview.openDevTools()
  }

  return (
    <Main height='full'>
      <webview
        id='webview'
        src={url}
        style={{
          minHeight: url !== '' ? '60em' : '0px',
        }}
      ></webview>
      <Stack direction={{ base: 'column', md: 'column' }} height='full'>
        <form onSubmit={loadUrl}>
          <HStack>
            <Input
              disabled={loading}
              value={inputUrl}
              onChange={e => formatAndSaveUrl(e.target.value)}
            />
            <Button isLoading={loading} type='submit'>
              Load URL
            </Button>
            <IconButton
              aria-label='Go back'
              icon={<ArrowBackIcon />}
              onClick={goBack}
              isLoading={loading}
            />
            <IconButton
              aria-label='Go forward'
              icon={<ArrowForwardIcon />}
              onClick={goForward}
              isLoading={loading}
            />
            <IconButton aria-label='Open developer tools' icon={<FaBug />} onClick={openDevTools} />
          </HStack>
        </form>

        <Card
          height='full'
          flex={1}
          style={
            url === ''
              ? {
                  height: '0px',
                }
              : {}
          }
        >
          <Card.Body height='full'>
            {failedToLoad && (
              <Alert status='error'>
                <AlertIcon />
                This webpage failed to load
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Stack>
    </Main>
  )
}
