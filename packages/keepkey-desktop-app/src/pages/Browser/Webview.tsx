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

    useEffect(() => {
        const webview: HTMLWebViewElement | null = document.getElementById(id) as HTMLWebViewElement | null;

        if (!webview) {
            console.error("Webview not available");
            return;
        }

        const handleLoadStart = () => setLoading(true);
        const handleLoadStop = () => {
            setLoading(false);
            setCanGoBack(webview.canGoBack());
            setCanGoForward(webview.canGoForward());
            setWebviewReady(true); // Ensure webview is ready before other operations
        };
        const handleLoadFail = (event: Event) => {
            console.log('Failed to load:', event);
            setLoading(false);
            setWebviewLoadFailure('Failed to load webview');
        };

        webview.addEventListener('did-start-loading', handleLoadStart);
        webview.addEventListener('did-stop-loading', handleLoadStop);
        webview.addEventListener('did-fail-load', handleLoadFail);

        return () => {
            webview.removeEventListener('did-start-loading', handleLoadStart);
            webview.removeEventListener('did-stop-loading', handleLoadStop);
            webview.removeEventListener('did-fail-load', handleLoadFail);
        };
    }, [id]);

    return (
        <>
            <HStack>
                <Input
                    disabled={loading}
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onBlur={() => setUrl(inputUrl)}
                />
                {loading ? (
                    <IconButton aria-label='Stop' icon={<CloseIcon />} onClick={() => setLoading(false)} />
                ) : (
                    <IconButton aria-label='Reload' icon={<RepeatIcon />} onClick={() => setUrl(inputUrl)} />
                )}
                <IconButton
                    aria-label='Back'
                    icon={<ArrowLeftIcon />}
                    onClick={() => webview?.canGoBack() && webview.goBack()}
                    isLoading={loading}
                    isDisabled={!canGoBack}
                />
                <IconButton
                    aria-label='Forward'
                    icon={<ArrowRightIcon />}
                    onClick={() => webview?.canGoForward() && webview.goForward()}
                    isLoading={loading}
                    isDisabled={!canGoForward}
                />
                <IconButton aria-label='Open developer tools' icon={<FaBug />} onClick={() => webview?.openDevTools()} />
            </HStack>
            <webview
                id={id}
                partition='persist:session'
                src={url}
                style={{ flexGrow: 8 }}
                allowpopups='true'
            ></webview>
        </>
    );
};

export default Webview;

