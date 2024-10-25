import { Divider, HStack, Stack } from '@chakra-ui/layout';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Avatar, Link, Button, Icon, Text } from '@chakra-ui/react';
import { useModal } from 'hooks/useModal/useModal';
import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import { IoFileTray } from 'react-icons/io5';
import { TbRefreshAlert } from 'react-icons/tb';
import { MdPlayArrow, MdStop, MdViewList } from 'react-icons/md';
import { FC } from 'react';
import axios from 'axios';

import { SettingsListItem } from './SettingsListItem';

interface OllamaSettingsProps {
    shouldAutoUpdate: boolean;
    shouldMinimizeToTray: boolean;
    allowPreRelease: boolean;
    autoScanQr: boolean;
}

export const OllamaSettings: FC = () => {
    const { settings, onboardingSteps } = useModal();
    const [appSettings, setAppSettings] = useState<OllamaSettingsProps>({
        shouldAutoUpdate: true,
        shouldMinimizeToTray: true,
        allowPreRelease: false,
        autoScanQr: false,
    });

    const [prevAppSettings, setPrevAppSettings] = useState<OllamaSettingsProps>(appSettings);
    const [isOllamaRunning, setIsOllamaRunning] = useState(false);

    const handleTestConnection = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:11434/');
            console.log('Ollama is healthy:', response.data);
            setIsOllamaRunning(true);
        } catch (error) {
            console.error('Ollama is not responding:', error);
            setIsOllamaRunning(false);
        }
    };

    useEffect(() => {
        handleTestConnection();
    }, []);

    useEffect(() => {
        if (
            prevAppSettings &&
            appSettings.shouldAutoUpdate === prevAppSettings.shouldAutoUpdate &&
            appSettings.shouldMinimizeToTray === prevAppSettings.shouldMinimizeToTray &&
            appSettings.allowPreRelease === prevAppSettings.allowPreRelease &&
            appSettings.autoScanQr === prevAppSettings.autoScanQr
        ) return;

        setPrevAppSettings(appSettings);
        console.log('APP SETTINGS SAVED', appSettings);
    }, [appSettings, prevAppSettings]);

    return (
        <Stack width='full' p={0}>
            <Divider my={1} />
            <Link href='http://127.0.0.1:11434/' isExternal>
                <SettingsListItem
                    icon={<Icon as={ExternalLinkIcon} color='gray.500' />}
                    label='connectWallet.menu.openDev'
                />
            </Link>
            <Divider my={1} />
            <HStack>
                <SettingsListItem
                    label={'Test Connection'}
                    onClick={handleTestConnection}
                    icon={<Icon as={HiRefresh} color='gray.500' />}
                >
                    <Button variant={'ghost'} onClick={handleTestConnection}>
                        Test
                    </Button>
                </SettingsListItem>
                <Text color={isOllamaRunning ? 'green.500' : 'red.500'}>
                    {isOllamaRunning ? 'Online' : 'Offline'}
                </Text>
            </HStack>
        </Stack>
    );
};
