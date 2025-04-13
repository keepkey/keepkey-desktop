import {
  Box,
  Button,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Badge,
  VStack,
  HStack,
  Flex,
  Text as ChakraText,
} from '@chakra-ui/react'
import { FaUsb, FaExclamationTriangle } from 'react-icons/fa'
import { useModal } from 'hooks/useModal/useModal'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useCallback, useEffect, useState } from 'react'

export type TroubleshootConnectionProps = {
  onComplete?: () => void
}

export const TroubleshootConnectionModal = ({ onComplete }: TroubleshootConnectionProps) => {
  const { troubleshootConnection } = useModal()
  const { close, isOpen } = troubleshootConnection

  // Troubleshooting state
  const [troubleshootStep, setTroubleshootStep] = useState(1)
  const [usbDevices, setUsbDevices] = useState<string[]>([])
  const [initialDeviceCount, setInitialDeviceCount] = useState(0)
  const [currentDeviceCount, setCurrentDeviceCount] = useState(0)
  const [cableReplaced, setCableReplaced] = useState(false)
  const [isCheckingDevices, setIsCheckingDevices] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTroubleshootStep(1)
      setUsbDevices([])
      setInitialDeviceCount(0)
      setCurrentDeviceCount(0)
      setCableReplaced(false)
      getUsbDevices()
    }
  }, [isOpen])

  // Mock function to simulate getting USB devices
  const getUsbDevices = useCallback(() => {
    setIsCheckingDevices(true)
    
    // Simulate API delay
    setTimeout(() => {
      // This is a mock implementation - in a real app, you would use a native API to detect USB devices
      const mockDevices = [
        'KeepKey Device (possibly disconnected)',
        'USB Composite Device',
        'Generic USB Hub',
        'USB Input Device'
      ];
      
      // Randomize the number of devices to simulate plugging/unplugging
      const deviceCount = troubleshootStep === 1 
        ? mockDevices.length 
        : (cableReplaced ? mockDevices.length + 1 : mockDevices.length);
      
      setUsbDevices(mockDevices.slice(0, deviceCount));
      setCurrentDeviceCount(deviceCount);
      
      if (troubleshootStep === 1) {
        setInitialDeviceCount(deviceCount);
      }
      
      setIsCheckingDevices(false);
    }, 1500);
  }, [troubleshootStep, cableReplaced]);

  // Handle device reconnection check
  const checkDeviceReconnection = useCallback(() => {
    getUsbDevices();
    
    // If we're on step 1 and there's no change in device count, move to step 2
    if (troubleshootStep === 1 && currentDeviceCount === initialDeviceCount) {
      setTimeout(() => {
        setTroubleshootStep(2);
      }, 2000);
    }
    
    // If we're on step 2 and the cable has been replaced but there's still no change, move to step 3
    if (troubleshootStep === 2 && cableReplaced && currentDeviceCount === initialDeviceCount) {
      setTimeout(() => {
        setTroubleshootStep(3);
      }, 2000);
    }
  }, [troubleshootStep, currentDeviceCount, initialDeviceCount, cableReplaced, getUsbDevices]);

  // Handle cable replacement
  const handleCableReplaced = () => {
    setCableReplaced(true);
    getUsbDevices();
  };

  // Handle keepkey-cli installation (mock)
  const installKeepKeyCli = () => {
    // This would actually install the CLI tool in a real implementation
    alert('keepkey-cli would be installed in a real implementation');
    if (onComplete) onComplete();
    close();
  };

  return (
    <SlideTransition>
      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        size="lg" 
        isCentered
      >
        <div style={{ '--chakra-zIndices-modal': troubleshootConnection.zIndex }}>
          <ModalOverlay backdropFilter="blur(5px)" />
          <ModalContent bg="gray.800" borderRadius="xl" borderWidth="1px" borderColor="gray.700">
            <ModalHeader color="white">
              <Text translation={'walletProvider.keepKey.troubleshoot.title'} fallback="Troubleshoot KeepKey Connection" />
              <Progress 
                value={(troubleshootStep / 3) * 100} 
                size="sm" 
                colorScheme="green" 
                borderRadius="full" 
                mt={2} 
              />
            </ModalHeader>
            <ModalCloseButton color="white" />
            
            <ModalBody pb={6}>
              {/* Step 1: Check USB devices */}
              {troubleshootStep === 1 && (
                <VStack align="stretch" spacing={4}>
                  <ChakraText color="white" fontWeight="bold">
                    Step 1: Check USB Connection
                  </ChakraText>
                  
                  <Box bg="gray.700" p={4} borderRadius="md">
                    <HStack mb={2} justify="space-between">
                      <ChakraText color="white">USB Devices</ChakraText>
                      <Badge colorScheme="blue">
                        Total: {usbDevices.length}
                      </Badge>
                    </HStack>
                    
                    {isCheckingDevices ? (
                      <Flex justify="center" py={4}>
                        <Progress size="xs" isIndeterminate width="100%" />
                      </Flex>
                    ) : (
                      <List spacing={2}>
                        {usbDevices.map((device, index) => (
                          <ListItem key={index} color="gray.300">
                            <ListIcon as={FaUsb} color="blue.400" />
                            {device}
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                  
                  <Box bg="gray.700" p={4} borderRadius="md">
                    <ChakraText color="white" fontWeight="semibold" mb={2}>
                      Next Steps:
                    </ChakraText>
                    <ChakraText color="gray.300" mb={3}>
                      1. Unplug your KeepKey device
                    </ChakraText>
                    <ChakraText color="gray.300" mb={3}>
                      2. Wait 5 seconds
                    </ChakraText>
                    <ChakraText color="gray.300" mb={3}>
                      3. Plug your KeepKey back in
                    </ChakraText>
                    <ChakraText color="gray.300" mb={4}>
                      4. Click "Check Connection" to verify
                    </ChakraText>
                  </Box>
                </VStack>
              )}
              
              {/* Step 2: Cable replacement */}
              {troubleshootStep === 2 && (
                <VStack align="stretch" spacing={4}>
                  <ChakraText color="white" fontWeight="bold">
                    Step 2: Try a Different USB Cable
                  </ChakraText>
                  
                  <Box bg="gray.700" p={4} borderRadius="md">
                    <HStack alignItems="center" mb={3}>
                      <Box as={FaExclamationTriangle} color="yellow.400" boxSize="20px" />
                      <ChakraText color="white" fontWeight="semibold" ml={2}>
                        No device change detected
                      </ChakraText>
                    </HStack>
                    
                    <ChakraText color="gray.300" mb={4}>
                      USB device count is still {currentDeviceCount}, suggesting your KeepKey isn't being recognized.
                    </ChakraText>
                    
                    <ChakraText color="white" fontWeight="semibold" mb={2}>
                      Next Steps:
                    </ChakraText>
                    <ChakraText color="gray.300" mb={3}>
                      1. Try using a different USB cable
                    </ChakraText>
                    <ChakraText color="gray.300" mb={3}>
                      2. Ensure you're using a USB port directly on your computer (not a hub)
                    </ChakraText>
                    <ChakraText color="gray.300" mb={4}>
                      3. Click "I've replaced the cable" after making these changes
                    </ChakraText>
                  </Box>
                  
                  {cableReplaced && (
                    <Box bg="gray.700" p={4} borderRadius="md">
                      <HStack mb={2} justify="space-between">
                        <ChakraText color="white">Current USB Devices</ChakraText>
                        <Badge colorScheme="blue">
                          Total: {usbDevices.length}
                        </Badge>
                      </HStack>
                      
                      {isCheckingDevices ? (
                        <Flex justify="center" py={4}>
                          <Progress size="xs" isIndeterminate width="100%" />
                        </Flex>
                      ) : (
                        <List spacing={2}>
                          {usbDevices.map((device, index) => (
                            <ListItem key={index} color="gray.300">
                              <ListIcon as={FaUsb} color="blue.400" />
                              {device}
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                </VStack>
              )}
              
              {/* Step 3: Terminal / CLI installation */}
              {troubleshootStep === 3 && (
                <VStack align="stretch" spacing={4}>
                  <ChakraText color="white" fontWeight="bold">
                    Step 3: Advanced Troubleshooting
                  </ChakraText>
                  
                  <Box 
                    bg="black" 
                    p={4} 
                    borderRadius="md" 
                    fontFamily="monospace" 
                    fontSize="sm"
                    color="green.400"
                    border="1px solid"
                    borderColor="gray.700"
                  >
                    <ChakraText mb={2}>$ lsusb | grep -i "keepkey"</ChakraText>
                    <ChakraText mb={2}>No KeepKey devices found</ChakraText>
                    <ChakraText mb={4}>$</ChakraText>
                    
                    <ChakraText color="white" mb={3}>
                      The CLI tool can help diagnose deeper connection issues.
                    </ChakraText>
                  </Box>
                  
                  <Box 
                    bg="gray.700" 
                    p={4} 
                    borderRadius="md"
                  >
                    <ChakraText color="white" fontWeight="semibold" mb={3}>
                      Installing the keepkey-cli tool will help with advanced troubleshooting:
                    </ChakraText>
                    <ChakraText color="gray.300" mb={3}>
                      • Directly communicate with your device
                    </ChakraText>
                    <ChakraText color="gray.300" mb={3}>
                      • Debug USB connection issues
                    </ChakraText>
                    <ChakraText color="gray.300" mb={4}>
                      • Test device functionality
                    </ChakraText>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            
            <ModalFooter>
              {troubleshootStep === 1 && (
                <Button colorScheme="blue" width="full" onClick={checkDeviceReconnection}>
                  Check Connection
                </Button>
              )}
              
              {troubleshootStep === 2 && !cableReplaced && (
                <Button colorScheme="blue" width="full" onClick={handleCableReplaced}>
                  I've replaced the cable
                </Button>
              )}
              
              {troubleshootStep === 2 && cableReplaced && (
                <Button colorScheme="blue" width="full" onClick={checkDeviceReconnection}>
                  Check Connection Again
                </Button>
              )}
              
              {troubleshootStep === 3 && (
                <Button colorScheme="blue" width="full" onClick={installKeepKeyCli}>
                  Install keepkey-cli
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </div>
      </Modal>
    </SlideTransition>
  )
} 