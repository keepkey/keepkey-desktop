import {
  Alert,
  AlertIcon,
  Button,
  HStack,
  ModalBody,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { ipcRenderer } from 'electron-shim'
import { useState } from 'react'
import { RawText } from 'components/Text'

export const UpdateBootloader = (params: any) => {
  const [loading, setLoading] = useState(false)

  const onAcceptUpdate = async () => {
    setLoading(true)
    console.log('onAcceptUpdate: ')
    ipcRenderer.send('@keepkey/update-bootloader', {})
  }

  return (
    <ModalBody pt={5}>
      {loading && (
        <Alert status='warning'>
          <AlertIcon />
          <RawText>Please follow the prompt shown on your KeepKey</RawText>
        </Alert>
      )}
      <Table size='sm'>
        <Thead>
          <Tr>
            <Th>Bootloader Version</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Current</Td>
            <Td>Recommended</Td>
          </Tr>
        </Tbody>
        <Tbody>
          <Tr>
            <Td>{params?.event?.bootloader}</Td>
            <Td>{params?.event?.recommendedBootloader}</Td>
          </Tr>
        </Tbody>
      </Table>
      <br />
      <HStack spacing={4}>
        <Button colorScheme='green' onClick={onAcceptUpdate} isLoading={loading}>
          Update
        </Button>
      </HStack>
    </ModalBody>
  )
}
