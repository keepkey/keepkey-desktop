// Browser.tsx
import { Main } from 'components/Layout/Main';
import Webview from './Webview';
import { useDisclosure } from '@chakra-ui/react';

export const Browser = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

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
            <Webview id="primary-webview" initialUrl="https://private.shapeshift.com/" isOpen={isOpen} onToggleOpen={onOpen} />
            {isOpen && (
                <Webview id="secondary-webview" initialUrl="https://wallet-connect-dapp-ochre.vercel.app/" isOpen={isOpen} onToggleOpen={onClose} />
            )}
        </Main>
    );
};
