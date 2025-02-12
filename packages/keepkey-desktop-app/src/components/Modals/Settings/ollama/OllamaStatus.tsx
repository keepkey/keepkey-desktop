import React, { FC, useState, useEffect } from 'react';
import { HStack, Text, Icon, Button } from '@chakra-ui/react';
import { HiRefresh } from 'react-icons/hi';
import axios from 'axios';

const OllamaStatus: FC = () => {
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

    return (
        <HStack>
            <Button variant="ghost" onClick={handleTestConnection} leftIcon={<Icon as={HiRefresh} />}>
                Test Connection
            </Button>
            <Text color={isOllamaRunning ? 'green.500' : 'red.500'}>
                {isOllamaRunning ? 'Online' : 'Offline'}
            </Text>
        </HStack>
    );
};

export default OllamaStatus;
