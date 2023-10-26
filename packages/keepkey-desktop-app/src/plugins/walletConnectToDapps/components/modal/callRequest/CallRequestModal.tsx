import { ModalContent } from '@chakra-ui/modal'
import { HStack, Modal, ModalCloseButton, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { WalletConnectIcon } from 'components/Icons/WalletConnectIcon'
import { Text } from 'components/Text'
import { WalletConnectWeb3Wallet } from 'kkdesktop/walletconnect/utils'
import { EIP155_SIGNING_METHODS } from 'plugins/walletConnectToDapps/data/EIP115Data'
import {
  rejectEIP155Request,
  rejectRequestAsUnsupported,
} from 'plugins/walletConnectToDapps/utils/utils'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import type { FC } from 'react'

import { EIP155SendTransactionConfirmation } from './EIP155SendTransactionConfirmation'
import { EIP155SignMessageConfirmation } from './EIP155SignMessageConfirmation'
import { SendTransactionConfirmation } from './SendTransactionConfirmation'
import { SignMessageConfirmation } from './SignMessageConfirmation'

export const NecessaryModal: FC<{ req?: any; isLegacy: boolean; removeReq: any }> = ({
  req,
  isLegacy,
  removeReq,
}) => {
  if (!req) return <></>
  console.log('req', req)
  console.log('isLegacy', isLegacy)
  if (isLegacy) {
    if (req.method === 'personal_sign') return <SignMessageConfirmation />
    else return <SendTransactionConfirmation />
  } else {
    if (!req.params.request) return <></>
    if (!req.params.request.method) return <></>
    switch (req.params.request.method) {
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      case EIP155_SIGNING_METHODS.ETH_SIGN:
        return <EIP155SignMessageConfirmation />

      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        return <EIP155SendTransactionConfirmation />

      default:
        const response = rejectRequestAsUnsupported(req)
        WalletConnectWeb3Wallet.respondSessionRequest({
          topic: req.topic,
          response,
        })
        removeReq(req.id)
        break
    }
  }
  return <></>
}

export const CallRequestModal = () => {
  const { requests, isLegacy, removeRequest } = useWalletConnect()
  const currentRequest = requests[0] as any

  return (
    <Modal
      isOpen={!!currentRequest}
      onClose={() => {
        const response = rejectEIP155Request(currentRequest)
        WalletConnectWeb3Wallet.respondSessionRequest({
          topic: currentRequest.topic,
          response,
        })
        removeRequest(currentRequest.id)
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
        {requests.length !== 0 && (
          <NecessaryModal req={currentRequest} isLegacy={isLegacy} removeReq={removeRequest} />
        )}
      </ModalContent>
    </Modal>
  )
}
