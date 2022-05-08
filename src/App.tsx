import { Alert, AlertDescription } from '@chakra-ui/alert'
import { Button } from '@chakra-ui/button'
import { ToastId, useToast } from '@chakra-ui/toast'
import { ipcRenderer } from 'electron'
import { useEffect, useRef } from 'react'
import { FaSync } from 'react-icons/fa'
import { useTranslate } from 'react-polyglot'
import { useHistory } from 'react-router'
import { Routes } from 'Routes/Routes'
import { IconCircle } from 'components/IconCircle'
import { PairingProps } from 'components/Modals/Pair/Pair'
import { useHasAppUpdated } from 'hooks/useHasAppUpdated/useHasAppUpdated'
import { useModal } from 'hooks/useModal/useModal'
// import { setupSentry } from 'lib/setupSentry'
import { logger } from 'lib/logger'

export const App = () => {
  const shouldUpdate = useHasAppUpdated()
  const toast = useToast()
  const toastIdRef = useRef<ToastId | null>(null)
  const updateId = 'update-app'
  const translate = useTranslate()
  const { pair, hardwareError } = useModal()
  const history = useHistory()

  // useEffect(setupSentry, [])

  useEffect(() => {
    ipcRenderer.on('@modal/pair', (event, data: PairingProps) => {
      pair.open(data)
    })
    ipcRenderer.on('@modal/hardwareError', (event, data) => {
      if (!data.close) hardwareError.open(data.data)
      else hardwareError.close()
    })
    ipcRenderer.on('@onboard/open', (event, data) => {
      history.push('/onboarding')
    })
  }, [pair, hardwareError, history])

  useEffect(() => {
    logger.debug({ shouldUpdate, updateId }, 'Update Check')
    if (shouldUpdate && !toast.isActive(updateId)) {
      const toastId = toast({
        render: () => {
          return (
            <Alert status='info' variant='update-box' borderRadius='lg'>
              <IconCircle boxSize={8} color='gray.500'>
                <FaSync />
              </IconCircle>
              <AlertDescription ml={3}>{translate('updateToast.body')}</AlertDescription>

              <Button colorScheme='blue' size='sm' onClick={() => window.location.reload()} ml={4}>
                {translate('updateToast.cta')}
              </Button>
            </Alert>
          )
        },
        id: updateId,
        duration: null,
        isClosable: false,
        position: 'bottom-right',
      })
      if (!toastId) return
      toastIdRef.current = toastId
    }
  }, [shouldUpdate, toast, translate])

  return <Routes />
}
