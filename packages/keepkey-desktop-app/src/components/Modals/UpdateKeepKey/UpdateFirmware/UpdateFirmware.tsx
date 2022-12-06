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
import { useEffect, useState } from 'react'
import { useModal } from 'hooks/useModal/useModal'
import { RawText } from 'components/Text'

export const UpdateFirmware = (params: any) => {
  const { requestBootloaderMode } = useModal()

  const [loading, setLoading] = useState(false)

  const onAcceptUpdate = async () => {
    setLoading(true)
    console.log('onAcceptUpdate: ')
    ipcRenderer.send('@keepkey/update-firmware', {})
  }

  const onSkipUpdate = async () => {
    console.log('onSkipUpdate: ')
    ipcRenderer.send('@keepkey/skip-update')
  }

  useEffect(() => {
    console.log('params: ', params)
    if (!params?.event?.bootloaderMode) requestBootloaderMode.open({ ...params.event })
    if (params?.event?.needsInitialize) requestBootloaderMode.close()
  }, [params, params.event, requestBootloaderMode])

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
            <Th>Firmware Version</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Recommended</Td>
          </Tr>
        </Tbody>
        <Tbody>
          <Tr>
            <Td>{params?.event?.recommendedFirmware}</Td>
          </Tr>
        </Tbody>
      </Table>
      <br />
      <HStack spacing={4}>
        <Button colorScheme='green' onClick={onAcceptUpdate} isLoading={loading}>
          Update
        </Button>
        <Button colorScheme='yellow' onClick={onSkipUpdate} isLoading={loading}>
          Skip
        </Button>
      </HStack>
    </ModalBody>
  )
}
