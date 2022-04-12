import { Button, Flex } from '@chakra-ui/react'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { ipcRenderer } from 'electron'
import { useEffect, useState } from 'react'
import { Route } from 'Routes/helpers'
import { Main } from 'components/Layout/Main'

// import { useEffect, useState } from 'react'
// import KeepKeyConnect from 'assets/hold-and-connect.svg'
// import KeepKeyRelease from 'assets/hold-and-release.svg'
// import { useWallet } from 'context/WalletProvider/WalletProvider'
// import { getAssetUrl } from 'lib/getAssetUrl'
import { BootloaderModal } from './steps/Bootloader'
import { FirmwareModal } from './steps/Firmware'
import { InitializeModal } from './steps/Initialize'

export const Onboarding = ({ route }: { route?: Route }) => {
  const [currentEvent, setCurrentEvent] = useState<any>({})

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

  useEffect(() => {
    ipcRenderer.on('@onboard/state', (event, data) => {
      setCurrentEvent(data)
    })

    return () => {
      ipcRenderer.removeAllListeners('@onboard/state')
    }
  }, [])

  const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
    initialStep: 0
  })

  useEffect(() => {
    if (!currentEvent) return
    if (currentEvent.bootloaderUpdateNeeded) setStep(0)
    if (currentEvent.firmwareUpdateNeeded) setStep(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEvent])

  const steps = [
    { label: 'Update Bootloader', Content: BootloaderModal },
    { label: 'Update Firmware', Content: FirmwareModal },
    { label: 'Initialize KeepKey', Content: InitializeModal }
  ]

  // @ts-ignore
  return (
    <Main route={route}>
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
    </Main>
  )
}
