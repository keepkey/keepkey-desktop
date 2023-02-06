import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { useModal } from 'hooks/useModal/useModal'
import { useEffect } from 'react'

import type { KKStateData } from '../../../../../keepkey-desktop/src/helpers/kk-state-controller/types'
import { KKState } from '../../../../../keepkey-desktop/src/helpers/kk-state-controller/types'
import { KeepKeyFactoryState } from './FactoryState'
import { UpdateBootloader } from './UpdateBootloader/UpdateBootloader'
import { UpdateFirmware } from './UpdateFirmware/UpdateFirmware'

export const UpdateKeepKey = (params: Record<string, never> | KKStateData) => {
  const { updateKeepKey } = useModal()
  const { isOpen } = updateKeepKey
  const { setStep, activeStep } = useSteps({
    initialStep: 0,
  })

  useEffect(() => {
    const state = params.state
    switch (state) {
      case undefined:
        break
      case KKState.UpdateBootloader:
        setStep(0)
        break
      case KKState.UpdateFirmware:
        setStep(1)
        break
      case KKState.NeedsInitialize:
        setStep(2)
        break
      default:
        console.error(`UpdateKeepKey called with unexpected state '${state}'`)
    }
  }, [params.state, setStep])

  const steps = [
    { label: 'Bootloader', content: <UpdateBootloader {...params} /> },
    { label: 'Firmware', content: <UpdateFirmware {...params} /> },
    { label: 'Create Wallet', content: <KeepKeyFactoryState /> },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // disconnect()
        // close()
        // setStep(0)
      }}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <div style={{ '--chakra-zIndices-modal': updateKeepKey.zIndex }}>
        <ModalOverlay />
        <ModalContent justifyContent='center' p={3}>
          {/*<ModalCloseButton ml='auto' borderRadius='full' position='static' />*/}
          <Steps activeStep={activeStep}>
            {steps.map(({ label, content }: any) => (
              <Step label={label} key={label}>
                {content}
              </Step>
            ))}
          </Steps>
        </ModalContent>
      </div>
    </Modal>
  )
}
