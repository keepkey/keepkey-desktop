import React, { FC, useEffect, useState } from 'react';
import {
  Stack,
  Divider,
  Box,
  Avatar,
  Link,
  Text,
  Switch,
  Badge,
  Code,
  VStack,
  HStack,
  Button,
  useToast,
  Icon,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon, CopyIcon } from '@chakra-ui/icons';
import { FaRobot, FaPlug, FaLock, FaCode } from 'react-icons/fa';
import { SettingsListItem } from './SettingsListItem';

interface McpConfig {
  enabled: boolean;
  signingEnabled: boolean;
  serverUrl: string;
  serverStatus: 'connected' | 'disconnected' | 'connecting';
}

export const McpSettings: FC = () => {
  const [mcpConfig, setMcpConfig] = useState<McpConfig>({
    enabled: false,
    signingEnabled: true,
    serverUrl: 'http://localhost:1646/mcp',
    serverStatus: 'disconnected'
  });
  
  const [showInstructions, setShowInstructions] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const toast = useToast();

  // Load MCP config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('@app/mcpConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setMcpConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse MCP config:', error);
      }
    }
  }, []);

  // Save MCP config to localStorage
  useEffect(() => {
    localStorage.setItem('@app/mcpConfig', JSON.stringify(mcpConfig));
  }, [mcpConfig]);

  const handleToggleEnabled = () => {
    setMcpConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleToggleSigning = () => {
    setMcpConfig(prev => ({ ...prev, signingEnabled: !prev.signingEnabled }));
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch(mcpConfig.serverUrl);
      if (response.ok) {
        setMcpConfig(prev => ({ ...prev, serverStatus: 'connected' }));
        toast({
          title: 'Connection Successful',
          description: 'Successfully connected to MCP server',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      setMcpConfig(prev => ({ ...prev, serverStatus: 'disconnected' }));
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to MCP server',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  const exampleMcpConfig = {
    "keepkey-mcp": {
      "url": "http://localhost:1646/mcp"
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'connecting': return 'yellow';
      case 'disconnected': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Stack width="full" p={0}>
      <Divider my={1} />
      
      {/* MCP Logo and Status */}
      <VStack spacing={3} mb={4}>
        <Icon as={FaRobot} boxSize={12} color="blue.400" />
        <Text fontSize="lg" fontWeight="bold">Model Context Protocol (MCP)</Text>
        <Badge colorScheme={getStatusColor(mcpConfig.serverStatus)} variant="subtle">
          {mcpConfig.serverStatus.toUpperCase()}
        </Badge>
      </VStack>

      <Divider my={1} />

      {/* Enable/Disable MCP */}
      <SettingsListItem
        label="Enable MCP Integration"
        onClick={handleToggleEnabled}
        icon={<Icon as={FaPlug} color="gray.500" />}
      >
        <Switch isChecked={mcpConfig.enabled} pointerEvents="none" />
      </SettingsListItem>

      <Divider my={1} />

      {/* Enable/Disable Signing */}
      <SettingsListItem
        label="Enable Transaction Signing"
        onClick={handleToggleSigning}
        icon={<Icon as={FaLock} color="gray.500" />}
      >
        <Switch isChecked={mcpConfig.signingEnabled} pointerEvents="none" />
      </SettingsListItem>

      <Divider my={1} />

      {/* Server URL and Test Connection */}
      <SettingsListItem
        label="MCP Server URL"
        icon={<Icon as={ExternalLinkIcon} color="gray.500" />}
      >
        <VStack align="stretch" spacing={2} w="full">
          <Code fontSize="sm" p={2} borderRadius="md">
            {mcpConfig.serverUrl}
          </Code>
          <Button
            size="sm"
            colorScheme="blue"
            isLoading={isTestingConnection}
            loadingText="Testing..."
            onClick={testConnection}
          >
            Test Connection
          </Button>
        </VStack>
      </SettingsListItem>

      <Divider my={1} />

      {/* Instructions Toggle */}
      <SettingsListItem
        label="Setup Instructions"
        onClick={() => setShowInstructions(!showInstructions)}
        icon={<Icon as={FaCode} color="gray.500" />}
      >
        <IconButton
          aria-label="Toggle instructions"
          icon={showInstructions ? <ChevronUpIcon /> : <ChevronDownIcon />}
          variant="ghost"
          size="sm"
        />
      </SettingsListItem>

      {/* Collapsible Instructions */}
      <Collapse in={showInstructions}>
        <Box p={4} bg="gray.50" borderRadius="md" mx={4}>
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold" fontSize="md">How to Connect to MCP</Text>
            
            <Text fontSize="sm">
              To connect your AI client to KeepKey's MCP server, add the following configuration to your MCP client:
            </Text>

            <Box position="relative">
              <Code
                display="block"
                whiteSpace="pre"
                p={3}
                fontSize="sm"
                borderRadius="md"
                bg="gray.800"
                color="white"
              >
                {JSON.stringify(exampleMcpConfig, null, 2)}
              </Code>
              <IconButton
                aria-label="Copy configuration"
                icon={<CopyIcon />}
                size="sm"
                position="absolute"
                top={2}
                right={2}
                onClick={() => copyToClipboard(JSON.stringify(exampleMcpConfig, null, 2))}
              />
            </Box>

            <VStack align="stretch" spacing={2}>
              <Text fontWeight="semibold" fontSize="sm">Available MCP Tools:</Text>
              <Text fontSize="xs" pl={4}>• System ping - Confirm device connectivity</Text>
              <Text fontSize="xs" pl={4}>• Get UTXO address - Get Bitcoin/altcoin addresses</Text>
              <Text fontSize="xs" pl={4}>• Sign UTXO transaction - Sign Bitcoin/altcoin transactions</Text>
              <Text fontSize="xs" pl={4}>• Get ETH address - Get Ethereum addresses</Text>
              <Text fontSize="xs" pl={4}>• Sign ETH transaction - Sign Ethereum transactions</Text>
              <Text fontSize="xs" pl={4}>• Sign typed data - Sign EIP-712 messages</Text>
            </VStack>

            <VStack align="stretch" spacing={2}>
              <Text fontWeight="semibold" fontSize="sm">Configuration Files:</Text>
              <Text fontSize="xs">• Cursor: ~/.cursor/mcp.json</Text>
              <Text fontSize="xs">• Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json</Text>
            </VStack>

            <Link href="http://localhost:1646/docs" isExternal>
              <Button leftIcon={<ExternalLinkIcon />} size="sm" variant="outline">
                View API Documentation
              </Button>
            </Link>
          </VStack>
        </Box>
      </Collapse>

      <Divider my={1} />

      {/* Connection Status Details */}
      {mcpConfig.enabled && (
        <>
          <Box p={4} bg={mcpConfig.serverStatus === 'connected' ? 'green.50' : 'red.50'} borderRadius="md" mx={4}>
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium">
                MCP Server Status
              </Text>
              <Badge colorScheme={getStatusColor(mcpConfig.serverStatus)}>
                {mcpConfig.serverStatus}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.600" mt={1}>
              {mcpConfig.serverStatus === 'connected' 
                ? 'KeepKey MCP server is running and accessible'
                : 'KeepKey MCP server is not accessible. Ensure the KeepKey desktop app is running.'
              }
            </Text>
          </Box>
          <Divider my={1} />
        </>
      )}

      {/* Security Notice */}
      <Box p={4} bg="yellow.50" borderRadius="md" mx={4}>
        <HStack align="start" spacing={2}>
          <Icon as={FaLock} color="yellow.500" mt={1} />
          <VStack align="stretch" spacing={1}>
            <Text fontSize="sm" fontWeight="medium" color="yellow.800">
              Security Notice
            </Text>
            <Text fontSize="xs" color="yellow.700">
              When transaction signing is enabled, AI assistants can request transaction signatures from your KeepKey. 
              Always verify transactions on your device before confirming.
            </Text>
          </VStack>
        </HStack>
      </Box>
    </Stack>
  );
}; 