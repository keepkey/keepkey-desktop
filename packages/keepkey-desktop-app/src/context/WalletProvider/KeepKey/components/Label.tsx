import { Button, Input, ModalBody, ModalHeader } from '@chakra-ui/react'
import type { ResetDevice } from '@shapeshiftoss/hdwallet-core'
import { Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import { useEffect, useState } from 'react'
import { useTranslate } from 'react-polyglot'

import { useKeepKeyRecover } from '../hooks/useKeepKeyRecover'
const moduleLogger = logger.child({ namespace: ['Label'] })

export const KeepKeyLabel = () => {
  const [loading, setLoading] = useState(true)
  const {
    setDeviceState,
    state: {
      deviceState: { disposition },
      wallet,
    },
    dispatch,
    desiredLabel,
    setDesiredLabel,
  } = useWallet()
  const translate = useTranslate()
  const recoverKeepKey = useKeepKeyRecover()

  const handleInitializeSubmit = async () => {
    setLoading(true)
    //We prevent all special chars and any length > 12. We just yolo trim and send it (user can change later)
    let sanitizedLabel = desiredLabel.replace(/[^\x00-\x7F]+/g, '').substring(0, 12)
    const resetMessage: ResetDevice = { label: sanitizedLabel ?? '', pin: true }
    setDeviceState({ awaitingDeviceInteraction: true, disposition })

    try {
      await wallet?.reset(resetMessage)
    } catch (e: any) {
      setLoading(false)
      setDeviceState({ awaitingDeviceInteraction: false, disposition })
      moduleLogger.error(e)
    }
  }

  useEffect(() => {
    // Label screen hangs if you click skip too quickly
    // Hack to keep that from happening
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [])

  const handleRecoverSubmit = async () => {
    setLoading(true)
    await recoverKeepKey(desiredLabel)
  }

  return (
    <>
      <ModalHeader>
        <Text translation={'modals.keepKey.label.header'} />
      </ModalHeader>
      <ModalBody>
        <Text color='gray.500' translation={'modals.keepKey.label.body'} mb={4} />
        <Input
          type='text'
          value={desiredLabel}
          disabled={loading}
          placeholder={translate('modals.keepKey.label.placeholder')}
          onChange={e => setDesiredLabel(e.target.value)}
          size='lg'
          variant='filled'
          mt={3}
          mb={6}
        />
        <Button
          width='full'
          size='lg'
          colorScheme='blue'
          onClick={disposition === 'initializing' ? handleInitializeSubmit : handleRecoverSubmit}
          disabled={loading}
          mb={3}
        >
          <Text
            translation={
              desiredLabel ? 'modals.keepKey.label.setLabelButton' : 'modals.keepKey.label.skipLabelButton'
            }
          />
        </Button>
      </ModalBody>
    </>
  )
}
