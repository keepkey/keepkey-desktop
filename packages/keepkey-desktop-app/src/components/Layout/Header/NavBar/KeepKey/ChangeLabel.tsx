import { Button, Flex, Input, useColorModeValue, useToast } from '@chakra-ui/react'
import { AwaitKeepKey } from 'components/Layout/Header/NavBar/KeepKey/AwaitKeepKey'
import { LastDeviceInteractionStatus } from 'components/Layout/Header/NavBar/KeepKey/LastDeviceInteractionStatus'
import { SubmenuHeader } from 'components/Layout/Header/NavBar/SubmenuHeader'
import { useKeepKey } from 'context/WalletProvider/KeepKeyProvider'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import { useState } from 'react'
import { useTranslate } from 'react-polyglot'

import { useMenuRoutes } from '../hooks/useMenuRoutes'
import { SubMenuBody } from '../SubMenuBody'
import { SubMenuContainer } from '../SubMenuContainer'

const moduleLogger = logger.child({
  namespace: ['Layout', 'Header', 'NavBar', 'KeepKey', 'ChangeLabel'],
})

let cancelled = false

export const ChangeLabel = () => {
  const translate = useTranslate()
  const toast = useToast()
  const { state, setDeviceState } = useWallet()
  const { walletInfo } = state
  const { keepKeyWallet, updateFeatures } = useKeepKey()
  const {
    state: {
      deviceState: { awaitingDeviceInteraction },
    },
  } = useWallet()
  const [keepKeyLabel, setKeepKeyLabel] = useState(walletInfo?.name)
  const { handleBackClick } = useMenuRoutes()

  const handleCancel = async () => {
    const fnLogger = moduleLogger.child({ namespace: ['handleChangeLabelBackClick'] })

    cancelled = true

    await keepKeyWallet
      ?.cancel()
      .catch(e => {
        fnLogger.error(e, 'Error cancelling new label...')
        toast({
          title: translate('common.error'),
          description: e?.message?.message ?? translate('common.somethingWentWrong'),
          status: 'error',
          isClosable: true,
        })
      })
      .finally(() => {
        setDeviceState({
          isUpdatingPin: false,
        })
      })
  }

  const handleHeaderBackClick = async () => {
    await handleCancel()
    await handleBackClick()
  }

  const handleChangeLabelInitializeEvent = async () => {
    if (!keepKeyWallet) return

    const fnLogger = moduleLogger.child({
      namespace: ['handleChangeLabelInitializeEvent'],
      keepKeyLabel,
    })
    fnLogger.trace('Applying Label...')

    setDeviceState({
      awaitingDeviceInteraction: true,
    })

    cancelled = false
    await keepKeyWallet
      .applySettings({ label: keepKeyLabel })
      .catch(e => {
        if (cancelled) return
        fnLogger.error(e, 'Error applying KeepKey settings')
        toast({
          title: translate('common.error'),
          description: e?.message ?? translate('common.somethingWentWrong'),
          status: 'error',
          isClosable: true,
        })
      })
      .finally(() => {
        setDeviceState({ awaitingDeviceInteraction: false })
        updateFeatures()
      })

    fnLogger.trace('KeepKey Label Applied')
  }
  const setting = 'label'
  const inputBackground = useColorModeValue('white', 'gray.800')
  const placeholderOpacity = useColorModeValue(0.6, 0.4)

  return (
    <SubMenuContainer>
      <Flex flexDir='column'>
        <div style={{ marginBottom: '0.75em' }}>
          <SubmenuHeader
            title={translate('walletProvider.keepKey.settings.headings.deviceSetting', {
              setting,
            })}
            description={translate('walletProvider.keepKey.settings.descriptions.label')}
            onBackClick={handleHeaderBackClick}
          />
        </div>
        <SubMenuBody>
          <LastDeviceInteractionStatus setting={setting} />
          <Input
            type='text'
            placeholder={translate('walletProvider.keepKey.settings.placeholders.label')}
            _placeholder={{ opacity: placeholderOpacity, color: 'inherit' }}
            size='md'
            background={inputBackground}
            onChange={e => setKeepKeyLabel(e.target.value)}
            value={keepKeyLabel}
            autoFocus
            disabled={awaitingDeviceInteraction}
          />
          <Button
            isLoading={awaitingDeviceInteraction}
            colorScheme='blue'
            size='sm'
            onClick={handleChangeLabelInitializeEvent}
          >
            {translate('walletProvider.keepKey.settings.actions.update', { setting })}
          </Button>
        </SubMenuBody>
        <AwaitKeepKey
          translation={['walletProvider.keepKey.settings.descriptions.buttonPrompt', { setting }]}
          onCancel={() => {
            cancelled = true
          }}
        />
      </Flex>
    </SubMenuContainer>
  )
}
