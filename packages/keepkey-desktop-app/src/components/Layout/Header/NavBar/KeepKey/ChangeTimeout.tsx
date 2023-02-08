import { useColorModeValue } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/toast'
import { AwaitKeepKey } from 'components/Layout/Header/NavBar/KeepKey/AwaitKeepKey'
import { LastDeviceInteractionStatus } from 'components/Layout/Header/NavBar/KeepKey/LastDeviceInteractionStatus'
import { SubmenuHeader } from 'components/Layout/Header/NavBar/SubmenuHeader'
import { Radio } from 'components/Radio/Radio'
import { DeviceTimeout, timeoutOptions, useKeepKey } from 'context/WalletProvider/KeepKeyProvider'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import { useCallback, useEffect, useState } from 'react'
import { useTranslate } from 'react-polyglot'

import { SubMenuBody } from '../SubMenuBody'
import { SubMenuContainer } from '../SubMenuContainer'

const moduleLogger = logger.child({
  namespace: ['Layout', 'Header', 'NavBar', 'KeepKey', 'ChangeTimeout'],
})

let cancelled = false

export const ChangeTimeout = () => {
  const translate = useTranslate()
  const {
    keepKeyWallet,
    state: { deviceTimeout },
    updateFeatures,
  } = useKeepKey()
  const {
    state: {
      deviceState: { awaitingDeviceInteraction },
    },
    setDeviceState,
  } = useWallet()
  const toast = useToast()
  const [radioTimeout, setRadioTimeout] = useState<DeviceTimeout>()

  const handleChange = useCallback(
    async (value: DeviceTimeout) => {
      if (!keepKeyWallet) return

      const oldValue = radioTimeout
      const parsedTimeout = value ? parseInt(value) : parseInt(DeviceTimeout.TenMinutes)
      const fnLogger = moduleLogger.child({ namespace: ['handleChange'] })
      fnLogger.trace({ parsedTimeout, oldValue }, 'Applying autoLockDelayMs...')

      setRadioTimeout(value)

      cancelled = false
      setDeviceState({ awaitingDeviceInteraction: true })
      await keepKeyWallet
        .applySettings({ autoLockDelayMs: parsedTimeout })
        .then(() => {
          fnLogger.trace({ parsedTimeout, oldValue }, 'Applied autoLockDelayMs')
        })
        .catch(e => {
          setRadioTimeout(oldValue)
          fnLogger.error(e, { parsedTimeout, oldValue }, 'Error applying autoLockDelayMs')
          if (!cancelled) {
            toast({
              title: translate('common.error'),
              description: e?.message ?? translate('common.somethingWentWrong'),
              status: 'error',
              isClosable: true,
            })
          }
        })
        .finally(() => {
          setDeviceState({ awaitingDeviceInteraction: false })
          updateFeatures()
        })
    },
    [radioTimeout, keepKeyWallet, setDeviceState, toast, translate, updateFeatures],
  )

  const handleCancel = useCallback(() => {
    cancelled = true
  }, [])

  const setting = 'timeout'
  const colorScheme = useColorModeValue('blackAlpha', 'white')
  const checkColor = useColorModeValue('green', 'blue.400')

  useEffect(() => {
    if (deviceTimeout?.value) {
      setRadioTimeout(deviceTimeout.value)
    }
  }, [deviceTimeout?.value])

  return (
    <SubMenuContainer>
      <SubmenuHeader
        title={translate('walletProvider.keepKey.settings.headings.deviceSetting', {
          setting: 'Timeout',
        })}
        description={translate('walletProvider.keepKey.settings.descriptions.timeout')}
      />
      <SubMenuBody>
        <LastDeviceInteractionStatus setting='timeout' />
        <Radio
          showCheck
          options={timeoutOptions}
          onChange={handleChange}
          colorScheme={colorScheme}
          value={radioTimeout}
          checkColor={checkColor}
          isLoading={awaitingDeviceInteraction}
          radioProps={{ width: 'full', justifyContent: 'flex-start' }}
          buttonGroupProps={{
            display: 'flex',
            flexDirection: 'column',
            width: 'full',
            alignItems: 'flex-start',
            flex: 1,
            spacing: '0',
          }}
        />
      </SubMenuBody>
      <AwaitKeepKey
        translation={['walletProvider.keepKey.settings.descriptions.buttonPrompt', { setting }]}
        onCancel={handleCancel}
      />
    </SubMenuContainer>
  )
}
