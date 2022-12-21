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
import { RawText } from 'components/Text'
import { ipcRenderer } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import { useEffect, useState } from 'react'

export const UpdateFirmware = (params: any) => {
  const { requestBootloaderMode } = useModal()

  const [loading, setLoading] = useState(false)

  const onAcceptUpdate = async () => {
    setLoading(true)
    ipcRenderer.send('@keepkey/update-firmware', {})
  }

  const onSkipUpdate = async () => {
    ipcRenderer.send('@keepkey/skip-update')
  }

  useEffect(() => {
    if (!params?.event?.bootloaderMode) requestBootloaderMode.open({ ...params.event })
    if (params?.event?.needsInitialize) requestBootloaderMode.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.event])

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
