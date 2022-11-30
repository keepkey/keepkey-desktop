import { ModalContent } from '@chakra-ui/modal'
import { HStack, Modal, ModalCloseButton, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { WalletConnectIcon } from 'components/Icons/WalletConnectIcon'
import { Text } from 'components/Text'

import { WalletConnectSignClient } from 'kkdesktop/walletconnect/utils'
import { rejectEIP155Request } from 'plugins/walletConnectToDapps/utils/utils'
import { SendTransactionConfirmation } from './SendTransactionConfirmation'
import { SignMessageConfirmation } from './SignMessageConfirmation'
import { SignMessageConfirmationV2 } from './SignMessageConfirmationv2'

export const CallRequestModal = () => {
  const { legacyBridge, requests, isLegacy, removeRequest } = useWalletConnect()
  const currentRequest = requests[0] as any

  console.log(currentRequest)

  return (
    <Modal
      isOpen={!!currentRequest}
      onClose={() => {
        if (isLegacy) {
          legacyBridge?.connector.rejectRequest({
            id: currentRequest.id,
            error: { message: 'Rejected by user' },
          })
        } else {
          const response = rejectEIP155Request(currentRequest)
          WalletConnectSignClient.respond({
            topic: currentRequest.topic,
            response
          })
        }
        removeRequest(0)
      }}
      variant='header-nav'
    >
      <ModalOverlay />
      <ModalContent
        width='full'
        borderRadius={{ base: 0, md: 'xl' }}
        minWidth={{ base: '100%', md: '500px' }}
        maxWidth={{ base: 'full', md: '500px' }}
      >
        <ModalHeader py={2}>
          <HStack alignItems='center' spacing={2}>
            <WalletConnectIcon />
            <Text fontSize='md' translation='plugins.walletConnectToDapps.modal.title' flex={1} />
            <Text rounded='lg' fontSize='sm' px='2' bgColor='purple.600' translation='ethereum' />
            <ModalCloseButton position='static' />
          </HStack>
        </ModalHeader>
        {isLegacy ?
          (currentRequest && currentRequest.method === 'personal_sign' ? (
            <SignMessageConfirmation />
          ) : (
            <SendTransactionConfirmation />
          ))
          : (currentRequest && currentRequest.params.request.method === 'personal_sign') && <SignMessageConfirmationV2 />
        }
      </ModalContent>
    </Modal>
  )
}
