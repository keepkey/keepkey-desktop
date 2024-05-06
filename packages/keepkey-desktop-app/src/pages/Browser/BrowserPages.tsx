import React from 'react';
import { Main } from 'components/Layout/Main';
import Webview from './Webview';
import { useDisclosure, Tabs, TabList, Tab, TabPanels, TabPanel, Flex, Box, Stack } from '@chakra-ui/react';

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
            <Stack direction={{ base: 'column', md: 'column' }} height='full' style={{ margin: '5px' }}>
                <Stack direction='row' flex={1}>
                    <Tabs variant='enclosed' flexGrow={1}>
                        <TabList>
                            <Tab>Primary Webview</Tab>
                            {isOpen && <Tab>Secondary Webview</Tab>}
                            <Tab onClick={onOpen}>+ Open New Tab</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Flex direction="column" height="100%">
                                    <Box flex="1" width="100%" height="100%">
                                        <Webview id="primary-webview" initialUrl="https://private.shapeshift.com/" isOpen={true} onToggleOpen={onOpen} />
                                    </Box>
                                </Flex>
                            </TabPanel>
                            {isOpen && (
                                <TabPanel>
                                    <Flex direction="column" height="100%">
                                        <Box flex="1" width="100%" height="100%">
                                            <Webview id="secondary-webview" initialUrl="https://wallet-connect-dapp-ochre.vercel.app/" isOpen={true} onToggleOpen={onClose} />
                                        </Box>
                                    </Flex>
                                </TabPanel>
                            )}
                        </TabPanels>
                    </Tabs>
                </Stack>
            </Stack>
        </Main>
    );
};

export default Browser;
