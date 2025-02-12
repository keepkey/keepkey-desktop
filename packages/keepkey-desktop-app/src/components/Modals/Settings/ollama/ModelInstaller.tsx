import React, { FC, useState } from 'react';
import { VStack, Text, Progress, Button } from '@chakra-ui/react';
// @ts-ignore
import { Ollama } from 'keepkey-ollama/browser';

interface ModelInstallerProps {
    modelName: string;
    onInstallComplete: () => void;
    setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

const ModelInstaller: FC<ModelInstallerProps> = ({ modelName, onInstallComplete, setLogs }) => {
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [installing, setInstalling] = useState(false);

    const downloadModel = async () => {
        setInstalling(true);
        setDownloadProgress(0);
        console.log(`Downloading model: ${modelName}...`);
        setLogs((prevLogs) => [...prevLogs, `Downloading model: ${modelName}...`]);

        try {
            // Use Ollama.pull to download the model with streaming
            const stream = await Ollama.pull({ model: modelName, stream: true });

            // Loop through the stream to track progress
            for await (const part of stream) {
                if (part.total && part.completed) {
                    const percent = Math.round((part.completed / part.total) * 100);
                    setDownloadProgress(percent);
                    setLogs((prevLogs) => [...prevLogs, `Download progress: ${percent}%`]);
                } else if (part.status) {
                    setLogs((prevLogs) => [...prevLogs, `${part.status}`]);
                }
            }

            console.log(`Model ${modelName} downloaded successfully.`);
            setLogs((prevLogs) => [...prevLogs, `Model ${modelName} downloaded successfully.`]);
            setInstalling(false);
            onInstallComplete();
        } catch (error) {
            console.error(`Error downloading model ${modelName}:`, error);
            setLogs((prevLogs) => [...prevLogs, `Error downloading model ${modelName}: ${error}`]);
            setInstalling(false);
        }
    };

    return (
        <VStack>
            <Text>Model "{modelName}" is not installed.</Text>
            <Button onClick={downloadModel} isDisabled={installing}>
                {installing ? 'Installing...' : 'Install Model'}
            </Button>
            {installing && (
                <>
                    <Text>Download Progress:</Text>
                    <Progress value={downloadProgress} size="sm" width="100%" />
                </>
            )}
        </VStack>
    );
};

export default ModelInstaller;
