import {
    ArrowForwardIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CloseIcon,
    RepeatIcon,
} from '@chakra-ui/icons'
import { HStack, IconButton, Input, Stack, useDisclosure,   Drawer,
    DrawerContent,
    DrawerOverlay, Button, IconButton, Avatar } from '@chakra-ui/react'
import * as Comlink from 'comlink'
import { Main } from 'components/Layout/Main'
import { getConfig } from 'config'
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
    if (url.origin === getConfig().REACT_APP_SHAPESHIFT_DAPP_URL) {
        const webview = getWebview()
        if (!webview) return

        webview
            .executeJavaScript('localStorage.getItem("@app/ssautologin");', true)
            .then(ssautologin => {
                if (!ssautologin) {
                    const kkDesktopApiKey = localStorage.getItem('@app/serviceKey')
                    const localWalletDeviceId = localStorage.getItem('localWalletDeviceId')
                    if (!kkDesktopApiKey || !localWalletDeviceId) return

                    ipcListeners.getSSAutoLogin(localWalletDeviceId, kkDesktopApiKey).then(
                        injection => webview.executeJavaScript(injection),
                        // .then(() => webview.reload())
                    )
                }
            })
            .catch(console.error)
    }
}

export const Browser = () => {
    const [url, setUrl] = useState('https://private.shapeshift.com/')
    const [inputUrl, setInputUrl] = useState(url)
    const [loading, setLoading] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [webviewLoadFailure, setWebviewLoadFailure] = useState<string | undefined>(undefined)
    const [canGoBack, setCanGoBack] = useState(false)
    const [canGoForward, setCanGoForward] = useState(false)
    const [forceLoad, setForceLoad] = useState(false)
    const {
        dispatch,
        state: { browserUrl, walletConnectUri, walletConnectOpen },
    } = useWallet()

    const [webviewReady, setWebviewReady] = useState(false)

    useEffect(() => {
        const setupListeners = () => {
            const webview = getWebview();
            if (!webview) {
                console.error("Webview not available");
                return;
            }

            const listener = () => {
                const currentUrl = webview.getURL();
                const urlParams = new URL(currentUrl).searchParams;
                const walletConnect = urlParams.get('walletconnect');
                console.log("URL changed to:", currentUrl);  // Debug: Log current URL
                console.log("walletconnect parameter:", walletConnect);  // Debug: Log walletconnect param
            };

            webview.addEventListener('did-stop-loading', listener);
            return () => {
                webview.removeEventListener('did-stop-loading', listener);
            };
        };

        setupListeners();
    }, [onOpen, onClose]);  // Include dependencies if they change over time

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

            ipcListeners
                .getBrowserInjection(sdkApiKey)
                .then(injection => webview.executeJavaScript(injection))
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
        if (!webviewReady) return
        if (!walletConnectUri) return
        toggleSecondWebview()
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

    //walletConnectOpen
    useEffect(() => {
        toggleSecondWebview()
    }, [walletConnectOpen])
    
    // Add a button to manually toggle the drawer for debugging
    const toggleSecondWebview = () => {
        if (isOpen) {
            onClose();
        } else {
            onOpen();
        }
    };

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
                        src='https://wallet-connect-dapp-ochre.vercel.app/'
                        style={{ flex: 4 }}
                    ></webview>
                </Stack>
            </Stack>
        </Main>
    )
}
