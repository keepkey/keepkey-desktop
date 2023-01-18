import { Divider, Stack } from '@chakra-ui/layout'
import { Icon, Switch } from '@chakra-ui/react'
import { ipcListeners } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { FaRocket } from 'react-icons/fa'
import { HiRefresh } from 'react-icons/hi'
import { IoFileTray } from 'react-icons/io5'
import { TbRefreshAlert } from 'react-icons/tb'

import type { Settings } from '../../../../../keepkey-desktop/src/helpers/types'
import { SettingsListItem } from './SettingsListItem'

export const AppSettings: FC = () => {
  const { settings } = useModal()
  const [appSettings, setAppSettings] = useState<Settings>({
    shouldAutoLaunch: true,
    shouldAutoStartBridge: true,
    shouldMinimizeToTray: true,
    shouldAutoUpdate: true,
    allowPreRelease: false,
    allowBetaFirmware: false,
    bridgeApiPort: 1646,
    autoScanQr: false,
  })

  const [prevAppSettings, setPrevAppSettings] = useState<Settings>(appSettings)

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
      if (settings.isOpen) {
        setAppSettings(await ipcListeners.appSettings())
      }
    })().catch(e => console.error(e))
  }, [settings.isOpen])

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
      <SettingsListItem
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
      </SettingsListItem>
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
      <SettingsListItem
        label={'modals.settings.allowBetaFirmware'}
        onClick={() => {
          setAppSettings(currentSettings => {
            return {
              ...currentSettings,
              allowBetaFirmware: !currentSettings.allowBetaFirmware,
            }
          })
        }}
        icon={<Icon as={TbRefreshAlert} color='gray.500' />}
      >
        <Switch isChecked={appSettings.allowBetaFirmware} pointerEvents='none' />
      </SettingsListItem>
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
    </Stack>
  )
}
