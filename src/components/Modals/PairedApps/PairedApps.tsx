import {
  Box,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text as ChakraText,
} from '@chakra-ui/react'
import dayjs from 'dayjs'
import { ipcRenderer } from 'electron'
import { useEffect, useState } from 'react'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'

export type PairedAppProps = {
  addedOn: number
  serviceName: string
  serviceImageUrl: string
  serviceKey: string
}

export const PairedAppsModal = () => {
  const { pairedApps } = useModal()
  const { close, isOpen } = pairedApps
  const [apps, setApps] = useState<PairedAppProps[]>()

  useEffect(() => {
    ipcRenderer.send('@bridge/paired-apps')
    ipcRenderer.on('@bridge/paired-apps', (_event, data: PairedAppProps[]) => {
      setApps(data)
    })
  }, [])

  useEffect(() => {
    ipcRenderer.send('@bridge/paired-apps')
  }, [isOpen])

  const unpair = (app: PairedAppProps) => {
    ipcRenderer.send('@bridge/remove-service', app)
    ipcRenderer.send('@bridge/paired-apps')
  }

  return (
    <SlideTransition>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          ipcRenderer.send('unlockWindow', {})
          close()
        }}
        isCentered
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
          <ModalCloseButton ml='auto' borderRadius='full' position='static' />
          <ModalHeader>
            <Text translation={'modals.pairedApps.header'} />
          </ModalHeader>
          <ModalBody>
            <Stack spacing={4} mb={4}>
              <Text color='gray.500' translation={'modals.pairedApps.body'} />
              {apps &&
                apps.map(app => (
                  <Box display='flex' flexDirection='row' alignItems='center' gap='10px'>
                    <Image src={app.serviceImageUrl} borderRadius='full' height='10' width='10' />
                    <Box display='flex' flexDirection='row' flexGrow={1} alignItems='center'>
                      <p>{app.serviceName}</p>
                    </Box>
                    <Box>
                      <ChakraText color='gray.500' fontSize='xs'>
                        {dayjs(app.addedOn).format('DD/MM/YYYY - HH:mm')}
                      </ChakraText>
                    </Box>
                    <Box>
                      <Button
                        colorScheme='red'
                        onClick={() => {
                          unpair(app)
                        }}
                      >
                        <Text translation={'modals.pairedApps.cta.unpair'} />
                      </Button>
                    </Box>
                  </Box>
                ))}
              {(!apps || apps.length === 0) && <Text translation={'modals.pairedApps.noApps'} />}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SlideTransition>
  )
}
