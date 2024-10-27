import React, { FC } from 'react';
import { HStack, Text, Select } from '@chakra-ui/react';

interface KnownModel {
    name: string;
    sizes: string[];
}

interface ModelSelectorProps {
    installedModels: string[];
    knownModels: KnownModel[];
    onModelSelect: (model: string) => void;
}

const ModelSelector: FC<ModelSelectorProps> = ({ installedModels, knownModels, onModelSelect }) => {
    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const modelName = e.target.value;
        onModelSelect(modelName);
    };

    return (
        <HStack>
            <Text>Select Model:</Text>
            <Select placeholder="Select model" onChange={handleModelChange}>
                {knownModels.map((model) => (
                    <option key={model.name} value={model.name}>
                        {model.name} {installedModels.includes(model.name) ? '(Installed)' : '(Not Installed)'}
                    </option>
                ))}
            </Select>
        </HStack>
    );
};

export default ModelSelector;
