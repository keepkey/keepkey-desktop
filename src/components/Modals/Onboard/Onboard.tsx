import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { ipcRenderer } from 'electron'
// import { useEffect, useState } from 'react'
// import KeepKeyConnect from 'assets/hold-and-connect.svg'
// import KeepKeyRelease from 'assets/hold-and-release.svg'
import { Text } from 'components/Text'
import { useModal } from 'context/ModalProvider/ModalProvider'

// import { useWallet } from 'context/WalletProvider/WalletProvider'
// import { getAssetUrl } from 'lib/getAssetUrl'
import { BootloaderModal } from './steps/Bootloader'
import { FirmwareModal } from './steps/Firmware'
import { InitializeModal } from './steps/Initialize'

export const OnboardModal = () => {
  const { onboard } = useModal()
  const { close, isOpen } = onboard

  // const [kkConnect, setKKConnect] = useState(KeepKeyConnect)
  // const [kkRelease, setKKRelease] = useState(KeepKeyRelease)

  // useEffect(() => {
  //   getAssetUrl(KeepKeyConnect).then(setKKConnect)
  //   getAssetUrl(KeepKeyRelease).then(setKKRelease)
  // }, [])

  // const HandleUpdateFirmware = async () => {
  //   console.info('Updating firmware (firmware modal)')
  //   // setLoadingFirmware(true)
  //   ipcRenderer.send('@keepkey/update-firmware', {})
  // }

  const steps = [
    { label: 'Update Bootloader', Content: BootloaderModal },
    { label: 'Update Firmware', Content: FirmwareModal },
    { label: 'Initialize KeepKey', Content: InitializeModal },
  ];
  const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });
  // @ts-ignore
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        ipcRenderer.send('unlockWindow', {})
        ipcRenderer.send('@modal/close', {})
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
          <Text translation={'modals.firmware.header'} />
        </ModalHeader>
        <ModalBody>
          <div>
            <Flex flexDir='column' width='100%'>
              <Steps activeStep={activeStep}>
                {steps.map(({ label, Content }) => (
                  <Step label={label} key={label}>
                    <Content />
                  </Step>
                ))}
              </Steps>
              {activeStep === steps.length ? (
                <Flex p={4}>
                  <Button mx='auto' size='sm' onClick={reset}>
                    Reset
                  </Button>
                </Flex>
              ) : (
                <Flex width='100%' justify='flex-end'>
                  <Button
                    isDisabled={activeStep === 0}
                    mr={4}
                    onClick={prevStep}
                    size='sm'
                    variant='ghost'
                  >
                    Prev
                  </Button>
                  <Button size='sm' onClick={nextStep}>
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Flex>
              )}
            </Flex>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
