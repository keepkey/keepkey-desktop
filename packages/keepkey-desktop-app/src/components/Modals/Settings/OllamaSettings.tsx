import React, { FC, useEffect, useState } from 'react';
import { Stack, Divider, Box, Avatar, Link, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import bex from 'assets/ollama.png';
import { SettingsListItem } from './SettingsListItem';
import OllamaStatus from './ollama/OllamaStatus';
import ModelSelector from './ollama/ModelSelector';
import ModelInstaller from './ollama/ModelInstaller';
import Logs from './ollama/Logs';
// @ts-ignore
import { Ollama } from 'keepkey-ollama/browser';

interface KnownModel {
    name: string;
    sizes: string[];
}

export const OllamaSettings: FC = () => {
    const [installedModels, setInstalledModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [needToInstall, setNeedToInstall] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    const knownModels: KnownModel[] = [
        { name: 'llama-3.2', sizes: ['small', 'medium', 'large'] },
        { name: 'gemma-2', sizes: ['small', 'medium'] },
        { name: 'dolphin-mixtral', sizes: ['medium', 'large'] },
    ];

    const listInstalledModels = async () => {
        try {
            const response = await Ollama.list();
            setInstalledModels(response.models);
        } catch (error) {
            console.error('Error listing models:', error);
            setLogs((prevLogs) => [...prevLogs, `Error listing models: ${error}`]);
        }
    };

    const handleModelSelect = (modelName: string) => {
        setSelectedModel(modelName);
        setNeedToInstall(!installedModels.includes(modelName));
    };

    const handleInstallComplete = () => {
        // After installation, refresh the installed models list
        listInstalledModels();
        setNeedToInstall(false);
    };

    useEffect(() => {
        listInstalledModels();
    }, []);

    return (
        <Stack width="full" p={0}>
            <Divider my={1} />
            <Box maxW={{ base: '100%', md: '45%' }} mb={{ base: 4, md: 0 }} mx="auto">
                <Avatar src={bex} size="lg" />
            </Box>

            <Link href="http://127.0.0.1:11434/" isExternal>
                <SettingsListItem
                    icon={<ExternalLinkIcon color="gray.500" />}
                    label="Open Ollama"
                />
            </Link>

            <Divider my={1} />

            {/* Model Selector */}
            <ModelSelector
                installedModels={installedModels}
                knownModels={knownModels}
                onModelSelect={handleModelSelect}
            />

            <Divider my={1} />

            {/* Install Model if needed */}
            {needToInstall && selectedModel && (
                <>
                    <ModelInstaller
                        modelName={selectedModel}
                        onInstallComplete={handleInstallComplete}
                        setLogs={setLogs}
                    />
                    <Divider my={1} />
                </>
            )}

            {/* Link to find more models */}
            <Link href="https://ollama.com/library" isExternal>
                Find more models
            </Link>

            <Divider my={1} />

            {/* Ollama Status */}
            <OllamaStatus />

            <Divider my={1} />

            {/* Logs Section */}
            <Logs logs={logs} showLogs={showLogs} setShowLogs={setShowLogs} />
        </Stack>
    );
};
