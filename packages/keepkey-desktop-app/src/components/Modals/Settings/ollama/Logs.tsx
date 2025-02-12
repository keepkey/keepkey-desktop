import React, { FC } from 'react';
import { Box, Button, Text, Icon } from '@chakra-ui/react';
import { MdViewList } from 'react-icons/md';

interface LogsProps {
    logs: string[];
    showLogs: boolean;
    setShowLogs: React.Dispatch<React.SetStateAction<boolean>>;
}

const Logs: FC<LogsProps> = ({ logs, showLogs, setShowLogs }) => {
    return (
        <Box>
            <Button variant="ghost" onClick={() => setShowLogs((prev) => !prev)}>
                {showLogs ? 'Hide Logs' : 'Show Logs'}
                <Icon as={MdViewList} ml={2} />
            </Button>
            {showLogs && (
                <Box p={2} maxH="200px" overflowY="auto" border="1px solid gray">
                    {logs.map((log, index) => (
                        <Text key={index} fontSize="sm">
                            {log}
                        </Text>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default Logs;
