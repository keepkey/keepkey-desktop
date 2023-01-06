import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import KeepKeyConnect from 'assets/connect-keepkey.svg'
import { Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTranslate } from 'react-polyglot'
import { useHistory } from 'react-router'

export const HardwareErrorModal = (error: { errorCode?: number; needsReconnect?: boolean }) => {
  const { hardwareError } = useModal()
  const { isUpdatingKeepkey } = useWallet()
  const translate = useTranslate()
  const { close, isOpen } = hardwareError

  const history = useHistory()

  useEffect(() => {
    if (
      history.location.pathname === '/onboarding' ||
      history.location.pathname === '/#/onboarding'
    )
      close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.pathname])

  const HandleTroubleShoot = async () => {
    //
    close()
  }

  return (
    <Modal
      isOpen={isOpen && !isUpdatingKeepkey && window.localStorage.getItem('onboarded') === 'true'}
      onClose={() => {
        close()
      }}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
        <ModalCloseButton ml='auto' borderRadius='full' position='static' />
        <ModalBody>
          {error.errorCode === 1 ? (
            <div>
              <ModalHeader>
                <Text translation='modals.keepKey.hardware.headerConnect' />
              </ModalHeader>
              <Image src={KeepKeyConnect} alt='Reconnect Device!' />
              <Text translation={'modals.keepKey.hardware.reconnect'} />

              <Button size='lg' colorScheme='blue' onClick={HandleTroubleShoot}>
                <Text translation={'modals.keepKey.hardware.troubleshoot'} />
              </Button>
              <Button size='lg' colorScheme='blue' ref='https://discord.gg/stfRnW3Jys'>
                <Text translation={'modals.common.getSupport'} />
              </Button>
            </div>
          ) : (
            <div>
              <ModalHeader>
                <Text
                  translation={
                    error.needsReconnect
                      ? 'modals.keepKey.hardware.headerReconnect'
                      : 'modals.keepKey.hardware.headerConnect'
                  }
                />
              </ModalHeader>
              <Image src={KeepKeyConnect} alt='Reconnect Device!' />
              <style type='text/css'>{`
                .hardwareErrorIntroText * {
                  margin: 0.5em 0;
                }

                .hardwareErrorIntroText :is(h1, h2, h3, h4, h5, h6) {
                  text-align: center;
                }
              `}</style>
              <div className='hardwareErrorIntroText'>
                <ReactMarkdown>
                  {translate(
                    error.needsReconnect
                      ? 'modals.keepKey.hardware.reconnect'
                      : 'modals.keepKey.hardware.connect',
                  )}
                </ReactMarkdown>
              </div>
              {/*<Button isDisabled={deviceBusy} onClick={retryPair}>*/}
              {/*  {`${deviceBusy ? 'Retry (Device busy, please wait)' : 'Retry'}`}*/}
              {/*</Button>*/}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
