import { Box, Button, Card, CardBody, CardHeader, Flex, Grid, GridItem, Icon, Image, ModalBody, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import cipher from 'assets/cipher.png'
import pin from 'assets/KKpin.png'
import { FaLock } from 'react-icons/fa'

export const Step2 = ({
  doNextStep,
  doPreviousStep,
}: {
  doNextStep: () => any
  doPreviousStep: () => any
}) => {
  // Define colors for better visual hierarchy
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const iconColor = useColorModeValue('green.500', 'green.300')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headerBg = useColorModeValue('gray.50', 'gray.800')

  return (
    <ModalBody p='6'>
      <Card 
        width="full" 
        bg={cardBgColor} 
        borderWidth="1px" 
        borderColor={borderColor} 
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        mb={6}
      >
        <CardHeader bg={headerBg} borderBottomWidth="1px" borderColor={borderColor}>
          <Flex align="center" justify="center">
            <Icon as={FaLock} color={iconColor} boxSize={6} mr={3} />
            <Text fontSize="xl" fontWeight="bold" translation='modals.onboarding.pinTitle' />
          </Flex>
        </CardHeader>
        <CardBody p={6}>
          <Text mb={6} color={textColor} fontSize="md">
            Your PIN is your first layer of security. It will be required every time you connect your KeepKey.
          </Text>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
            <GridItem colSpan={{ base: 1, md: 1 }}>
              <Card variant="outline" h="100%" borderColor={borderColor}>
                <CardBody>
                  <Text fontWeight="bold" mb={2} fontSize="md" textAlign="center">PIN Entry Screen</Text>
                  <Box display="flex" justifyContent="center">
                    <Image src={cipher} maxH="140px" objectFit="contain" />
                  </Box>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem colSpan={{ base: 1, md: 1 }}>
              <Card variant="outline" h="100%" borderColor={borderColor}>
                <CardBody>
                  <Text fontWeight="bold" mb={2} fontSize="md" textAlign="center">PIN Instructions</Text>
                  <Text fontSize="sm" color={textColor} translation='modals.onboarding.pinText1' />
                  <Text mt={2} fontSize="sm" color={textColor} translation='modals.onboarding.pinText2' />
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem colSpan={{ base: 1, md: 1 }}>
              <Card variant="outline" h="100%" borderColor={borderColor}>
                <CardBody>
                  <Text fontWeight="bold" mb={2} fontSize="md" textAlign="center">PIN Example</Text>
                  <Box display="flex" justifyContent="center">
                    <Image src={pin} maxH="140px" objectFit="contain" />
                  </Box>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
          
          <Box mt={6} p={4} bg={headerBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
            <Text fontWeight="bold" fontSize="sm" color={iconColor}>Security Tip:</Text>
            <Text fontSize="sm" color={textColor}>
              Choose a unique PIN that is not easy to guess. Avoid using sequential numbers or personal information.
            </Text>
          </Box>
        </CardBody>
      </Card>

      <Flex justify="center">
        <Stack direction="row" spacing={4} width="full" maxWidth="md">
          <Button 
            width="full" 
            maxWidth="150px" 
            colorScheme="gray" 
            onClick={doPreviousStep}
            borderRadius="md"
            boxShadow="sm"
          >
            Previous
          </Button>
          <Button 
            width="full" 
            maxWidth="150px" 
            colorScheme="green" 
            onClick={doNextStep}
            borderRadius="md"
            boxShadow="sm"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            Next
          </Button>
        </Stack>
      </Flex>
    </ModalBody>
  )
}
