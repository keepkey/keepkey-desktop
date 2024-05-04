// ./support.tsx
import { ipcListeners } from 'electron-shim';
import { getConfig } from 'config';

export const getWebview = (id: string): any => document.getElementById(id) as any;

export const goBack = (webviewId: string): void => {
    const webview = getWebview(webviewId);
    if (webview && webview.canGoBack()) webview.goBack();
};

export const goForward = (webviewId: string): void => {
    const webview = getWebview(webviewId);
    if (webview && webview.canGoForward()) webview.goForward();
};

export const openDevTools = (webviewId: string): void => {
    const webview = getWebview(webviewId);
    if (webview) webview.openDevTools();
};

export const stopLoading = (webviewId: string): void => {
    const webview = getWebview(webviewId);
    if (webview) webview.stop();
};

export const formatUrl = (inputUrl: string): string | undefined => {
    try {
        return new URL(inputUrl).toString();
    } catch {
        try {
            return new URL(`https://${inputUrl}`).toString();
        } catch {
            return undefined;
        }
    }
};

export const clearClipBoardIfWCString = async (): Promise<void> => {
    try {
        const clipboardData = await navigator.clipboard.read();
        const link = await clipboardData[0].getType('text/plain');
        const clipboardUri = decodeURIComponent(await link.text());
        if (clipboardUri.includes('wc:')) {
            await navigator.clipboard.writeText('');
        }
    } catch (e) {
        console.error(e);
    }
};

export const checkIfSSDApp = (webviewId: string, currentUrl: string): void => {
    const url = new URL(currentUrl);
    if (url.origin === getConfig().REACT_APP_SHAPESHIFT_DAPP_URL) {
        const webview = getWebview(webviewId);
        if (!webview) return;

        webview.executeJavaScript('localStorage.getItem("@app/ssautologin");', true)
            .then(ssautologin => {
                if (!ssautologin) {
                    const kkDesktopApiKey = localStorage.getItem('@app/serviceKey');
                    const localWalletDeviceId = localStorage.getItem('localWalletDeviceId');
                    if (!kkDesktopApiKey || !localWalletDeviceId) return;

                    ipcListeners.getSSAutoLogin(localWalletDeviceId, kkDesktopApiKey)
                        .then(injection => webview.executeJavaScript(injection))
                        .catch(console.error);
                }
            })
            .catch(console.error);
    }
};
