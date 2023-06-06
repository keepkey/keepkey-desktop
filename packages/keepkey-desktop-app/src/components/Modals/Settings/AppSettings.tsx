import { Divider, HStack, Stack } from '@chakra-ui/layout'
import { Avatar, Button, Icon, IconButton, Switch } from '@chakra-ui/react'
import { WalletActions } from 'context/WalletProvider/actions'
import { ipcListeners } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { HiRefresh } from 'react-icons/hi'
import { IoFileTray } from 'react-icons/io5'
import { TbRefreshAlert } from 'react-icons/tb'
import { useHistory } from 'react-router'

import type { Settings } from '../../../../../keepkey-desktop/src/helpers/types'
import { SettingsListItem } from './SettingsListItem'

export const AppSettings: FC = () => {
  const { settings, onboardingSteps } = useModal()
  const [appSettings, setAppSettings] = useState<Settings>({
    shouldAutoLaunch: false,
    shouldAutoStartBridge: true,
    shouldMinimizeToTray: true,
    shouldAutoUpdate: true,
    allowPreRelease: false,
    allowBetaFirmware: false,
    bridgeApiPort: 1646,
    autoScanQr: false,
  })

  const [prevAppSettings, setPrevAppSettings] = useState<Settings>(appSettings)

  const [defaultDapp, setDefaultDapp] = useState<{ imageUrl: string; name: string; url?: string }>()
  const history = useHistory()

  const { dispatch } = useWallet()

  const openDapp = (url: string) => {
    dispatch({ type: WalletActions.SET_BROWSER_URL, payload: url })
    history.push('/browser')
  }

  useEffect(() => {
    ;(async () => {
      if (
        prevAppSettings &&
        appSettings.shouldAutoLaunch === prevAppSettings.shouldAutoLaunch &&
        appSettings.shouldAutoUpdate === prevAppSettings.shouldAutoUpdate &&
        appSettings.shouldMinimizeToTray === prevAppSettings.shouldMinimizeToTray &&
        appSettings.allowPreRelease === prevAppSettings.allowPreRelease &&
        appSettings.allowBetaFirmware === prevAppSettings.allowBetaFirmware &&
        appSettings.autoScanQr === prevAppSettings.autoScanQr
      )
        return
      setPrevAppSettings(appSettings)
      // console.log('APP SETTINGS SAVED')

      await ipcListeners.appUpdateSettings(appSettings)
    })().catch(e => console.error(e))
  }, [appSettings, prevAppSettings])

  useEffect(() => {
    ;(async () => {
      if (settings.isOpen || onboardingSteps.isOpen) {
        setAppSettings(await ipcListeners.appSettings())
      }
    })().catch(e => console.error(e))
    const rawapp = localStorage.getItem('@app/defaultDapp')
    if (!rawapp || rawapp === '') return
    const app = JSON.parse(rawapp)
    setDefaultDapp(app)
  }, [settings.isOpen, onboardingSteps.isOpen])

  return (
    <Stack width='full' p={0}>
      <Divider my={1} />
      <SettingsListItem
        label={'modals.settings.autoUpdate'}
        onClick={() => {
          setAppSettings(currentSettings => {
            return {
              ...currentSettings,
              shouldAutoUpdate: !currentSettings.shouldAutoUpdate,
            }
          })
        }}
        icon={<Icon as={HiRefresh} color='gray.500' />}
      >
        <Switch isChecked={appSettings.shouldAutoUpdate} pointerEvents='none' />
      </SettingsListItem>
      <Divider my={1} />
      {/* <SettingsListItem
        label={'modals.settings.autoLaunch'}
        onClick={() => {
          setAppSettings(currentSettings => {
            return {
              ...currentSettings,
              shouldAutoLaunch: !currentSettings.shouldAutoLaunch,
            }
          })
        }}
        icon={<Icon as={FaRocket} color='gray.500' />}
      >
        <Switch isChecked={appSettings.shouldAutoLaunch} pointerEvents='none' />
      </SettingsListItem> */}
      <Divider my={1} />
      <SettingsListItem
        label={'modals.settings.minimizeToTray'}
        onClick={() => {
          setAppSettings(currentSettings => {
            return {
              ...currentSettings,
              shouldMinimizeToTray: !currentSettings.shouldMinimizeToTray,
            }
          })
        }}
        icon={<Icon as={IoFileTray} color='gray.500' />}
      >
        <Switch isChecked={appSettings.shouldMinimizeToTray} pointerEvents='none' />
      </SettingsListItem>
      <Divider my={1} />
      <SettingsListItem
        label={'modals.settings.downloadPreRelease'}
        onClick={() => {
          setAppSettings(currentSettings => {
            return {
              ...currentSettings,
              allowPreRelease: !currentSettings.allowPreRelease,
            }
          })
        }}
        icon={<Icon as={TbRefreshAlert} color='gray.500' />}
      >
        <Switch isChecked={appSettings.allowPreRelease} pointerEvents='none' />
      </SettingsListItem>
      <Divider my={1} />
      {/*<SettingsListItem*/}
      {/*  label={'modals.settings.allowBetaFirmware'}*/}
      {/*  onClick={() => {*/}
      {/*    setAppSettings(currentSettings => {*/}
      {/*      return {*/}
      {/*        ...currentSettings,*/}
      {/*        allowBetaFirmware: !currentSettings.allowBetaFirmware,*/}
      {/*      }*/}
      {/*    })*/}
      {/*  }}*/}
      {/*  icon={<Icon as={TbRefreshAlert} color='gray.500' />}*/}
      {/*>*/}
      {/*  <Switch isChecked={appSettings.allowBetaFirmware} pointerEvents='none' />*/}
      {/*</SettingsListItem>*/}
      <Divider my={1} />
      <SettingsListItem
        label={'modals.settings.autoScanQr'}
        onClick={() => {
          setAppSettings(currentSettings => {
            return {
              ...currentSettings,
              autoScanQr: !currentSettings.autoScanQr,
            }
          })
        }}
        icon={<Icon as={TbRefreshAlert} color='gray.500' />}
      >
        <Switch isChecked={appSettings.autoScanQr} pointerEvents='none' />
      </SettingsListItem>
      <Divider my={1} />
      <SettingsListItem
        label={'modals.settings.clearStorage'}
        onClick={() => {
          ipcListeners.clearLocalStorage()
        }}
        icon={<Icon as={FaTrash} color='gray.500' />}
      >
        <IconButton
          variant={'ghost'}
          aria-label='Clear cache'
          onClick={() => ipcListeners.clearLocalStorage()}
          icon={<FaTrash />}
        />
      </SettingsListItem>
      {defaultDapp && <Divider my={1} />}
      {defaultDapp && (
        <SettingsListItem
          label={'modals.settings.resetDefaultDapp'}
          onClick={() => {
            localStorage.removeItem('@app/defaultDapp')
          }}
          icon={<Icon as={FaTrash} color='gray.500' />}
        >
          <HStack gap={0}>
            <Avatar src={defaultDapp.imageUrl} size='sm' />

            <Button variant={'link'} onClick={() => openDapp(defaultDapp.url ?? 'about:blank')}>
              {defaultDapp.name}
            </Button>
          </HStack>
        </SettingsListItem>
      )}
    </Stack>
  )
}
