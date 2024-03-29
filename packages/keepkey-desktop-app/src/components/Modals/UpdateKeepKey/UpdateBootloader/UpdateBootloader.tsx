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
import { ipcListeners } from 'electron-shim'
import { useState } from 'react'

import type { KKStateData } from '../../../../../../keepkey-desktop/src/helpers/kk-state-controller/types'
import { KKState } from '../../../../../../keepkey-desktop/src/helpers/kk-state-controller/types'

export const UpdateBootloader = (params: Record<string, never> | KKStateData) => {
  const [loading, setLoading] = useState(false)

  const onAcceptUpdate = async () => {
    setLoading(true)
    await ipcListeners.keepkeyUpdateBootloader()
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
            <Td>{params?.state === KKState.UpdateBootloader && params.bootloader}</Td>
            <Td>{params?.state === KKState.UpdateBootloader && params.recommendedBootloader}</Td>
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
