import { ModalContent } from '@chakra-ui/modal'
import { HStack, Modal, ModalCloseButton, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { WalletConnectIcon } from 'components/Icons/WalletConnectIcon'
import { Text } from 'components/Text'

import { WalletConnectSignClient } from 'kkdesktop/walletconnect/utils'
import { rejectEIP155Request, rejectRequestAsUnsupported } from 'plugins/walletConnectToDapps/utils/utils'
import { SendTransactionConfirmation } from './SendTransactionConfirmation'
import { SignMessageConfirmation } from './SignMessageConfirmation'
import { FC } from 'react'
import { EIP155SignMessageConfirmation } from './EIP155SignMessageConfirmation'
import { EIP155_SIGNING_METHODS } from 'plugins/walletConnectToDapps/data/EIP115Data'
import { EIP155SendTransactionConfirmation } from './EIP155SendTransactionConfirmation'


export const NecessaryModal: FC<{ req?: any, isLegacy: boolean, removeReq: any }> = ({ req, isLegacy, removeReq }) => {
  if (!req) return <></>
  if (isLegacy) {
    if (req.method === 'personal_sign') return <SignMessageConfirmation />
    else return <SendTransactionConfirmation />
  } else {
    switch (req.params.request.method) {
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      case EIP155_SIGNING_METHODS.ETH_SIGN:
        return <EIP155SignMessageConfirmation />

      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        return <EIP155SendTransactionConfirmation />

      default:
        const response = rejectRequestAsUnsupported(req)
        WalletConnectSignClient.respond({
          topic: req.topic,
          response
        })
        removeReq(0)
        break;
    }
  }
  return <></>
}


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
        {currentRequest && <NecessaryModal req={currentRequest} isLegacy={isLegacy} removeReq={removeRequest} />}
      </ModalContent>
    </Modal>
  )
}

