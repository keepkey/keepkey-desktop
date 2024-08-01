import { Divider, HStack, Stack } from '@chakra-ui/layout';
import { Avatar, Button, Icon, Text } from '@chakra-ui/react';
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

    const handleViewModels = () => {
        console.log('Viewing models...');
        // Mock action: Display a message or simulate viewing models
    };

    const handleStartOllama = () => {
        console.log('Starting Ollama...');
        // Mock action: Display a message or simulate starting Ollama
    };

    const handleStopOllama = () => {
        console.log('Stopping Ollama...');
        // Mock action: Display a message or simulate stopping Ollama
    };

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
        (async () => {
            if (
                prevAppSettings &&
                appSettings.shouldAutoUpdate === prevAppSettings.shouldAutoUpdate &&
                appSettings.shouldMinimizeToTray === prevAppSettings.shouldMinimizeToTray &&
                appSettings.allowPreRelease === prevAppSettings.allowPreRelease &&
                appSettings.autoScanQr === prevAppSettings.autoScanQr
            )
                return;
            setPrevAppSettings(appSettings);
            // Save settings
            console.log('APP SETTINGS SAVED', appSettings);
        })().catch(e => console.error(e));
    }, [appSettings, prevAppSettings]);

    return (
        <Stack width='full' p={0}>
            <Divider my={1} />
            <SettingsListItem
                label={'View Models'}
                onClick={handleViewModels}
                icon={<Icon as={MdViewList} color='gray.500' />}
            >
                <Button variant={'ghost'} onClick={handleViewModels}>
                    View Models
                </Button>
            </SettingsListItem>
            <Divider my={1} />
            <SettingsListItem
                label={'Start Ollama'}
                onClick={handleStartOllama}
                icon={<Icon as={MdPlayArrow} color='gray.500' />}
            >
                <Button variant={'ghost'} onClick={handleStartOllama}>
                    Start
                </Button>
            </SettingsListItem>
            <Divider my={1} />
            <SettingsListItem
                label={'Stop Ollama'}
                onClick={handleStopOllama}
                icon={<Icon as={MdStop} color='gray.500' />}
            >
                <Button variant={'ghost'} onClick={handleStopOllama}>
                    Stop
                </Button>
            </SettingsListItem>
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
