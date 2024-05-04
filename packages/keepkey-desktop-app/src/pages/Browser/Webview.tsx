// Webview.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { FaBug } from 'react-icons/fa';

import {
    ArrowForwardIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CloseIcon,
    RepeatIcon,
} from '@chakra-ui/icons';
import { HStack, IconButton, Input, Stack, Avatar, Button } from '@chakra-ui/react';
import { getConfig } from 'config';
import { ipcListeners } from 'electron-shim';

const Webview = ({ id, initialUrl, isOpen, onToggleOpen }: { id: string, initialUrl: string, isOpen: boolean, onToggleOpen: () => void }) => {
    const [url, setUrl] = useState(initialUrl);
    const [inputUrl, setInputUrl] = useState(initialUrl);
    const [loading, setLoading] = useState(false);
    const [webviewLoadFailure, setWebviewLoadFailure] = useState<string | undefined>(undefined);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [webviewReady, setWebviewReady] = useState(false);

    const getWebview = (): HTMLWebViewElement | null => document.getElementById(id) as HTMLWebViewElement | null;

    useEffect(() => {
        const webview = getWebview();
        const handleLoadStart = () => setLoading(true);
        const handleLoadStop = () => {
            setLoading(false);
            setCanGoBack(webview?.canGoBack() ?? false);
            setCanGoForward(webview?.canGoForward() ?? false);
        };
        const handleLoadFail = (event: Event) => {
            // Handle load fail
            console.log('Failed to load:', event);
            setLoading(false);
        };

        webview?.addEventListener('did-start-loading', handleLoadStart);
        webview?.addEventListener('did-stop-loading', handleLoadStop);
        webview?.addEventListener('did-fail-load', handleLoadFail);

        return () => {
            webview?.removeEventListener('did-start-loading', handleLoadStart);
            webview?.removeEventListener('did-stop-loading', handleLoadStop);
            webview?.removeEventListener('did-fail-load', handleLoadFail);
        };
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInputUrl(e.target.value);

    const handleReload = useCallback(() => {
        const webview = getWebview();
        if (webview && webviewReady) {
            webview.loadURL(inputUrl);
        }
        setLoading(true);
    }, [inputUrl, webviewReady]);

    const handleStopLoading = useCallback(() => {
        const webview = getWebview();
        webview?.stop();
        setLoading(false);
    }, []);

    const handleGoBack = useCallback(() => {
        const webview = getWebview();
        if (webview?.canGoBack()) {
            webview.goBack();
        }
    }, []);

    const handleGoForward = useCallback(() => {
        const webview = getWebview();
        if (webview?.canGoForward()) {
            webview.goForward();
        }
    }, []);

    const handleOpenDevTools = useCallback(() => {
        const webview = getWebview();
        webview?.openDevTools();
    }, []);

    return (
        <>
            <Stack direction={{ base: 'column', md: 'column' }} height='full'>
                <HStack>
                    <Input
                        disabled={loading}
                        value={inputUrl}
                        onChange={handleInputChange}
                        onBlur={handleReload}
                    />
                    {loading ? (
                        <IconButton aria-label='Stop' icon={<CloseIcon />} onClick={handleStopLoading} />
                    ) : (
                        <IconButton aria-label='Reload' icon={<RepeatIcon />} onClick={handleReload} />
                    )}
                    <IconButton
                        aria-label='Back'
                        icon={<ArrowLeftIcon />}
                        onClick={handleGoBack}
                        isLoading={loading}
                        isDisabled={!canGoBack}
                    />
                    <IconButton
                        aria-label='Forward'
                        icon={<ArrowRightIcon />}
                        onClick={handleGoForward}
                        isLoading={loading}
                        isDisabled={!canGoForward}
                    />
                    <IconButton aria-label='Open developer tools' icon={<FaBug />} onClick={handleOpenDevTools} />
                    <Button onClick={onToggleOpen}><Avatar size="xs" src="https://asset.brandfetch.io/id11-wfgsq/idYIhr7BJC.jpeg" />{isOpen ? 'Close' : 'Open'}</Button>
                </HStack>
            </Stack>
            <webview
                id={id}
                partition='persist:session'
                src={url}
                style={{ width: '100%', height: 'calc(100% - 45px)' }}
            ></webview>
        </>
    );
};

export default Webview;
