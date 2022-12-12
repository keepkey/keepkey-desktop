import { Stack, Divider } from '@chakra-ui/layout'
import { Icon, Switch } from '@chakra-ui/react'
import { ipcRenderer } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { FaRocket } from 'react-icons/fa'
import { HiRefresh } from 'react-icons/hi'
import { IoFileTray } from 'react-icons/io5'
import { TbRefreshAlert } from 'react-icons/tb'
import { SettingsListItem } from './SettingsListItem'

export type AppSettingsProps = {
  shouldAutoLunch: boolean
  shouldAutoStartBridge: boolean
  shouldMinimizeToTray: boolean
  shouldAutoUpdate: boolean
  allowPreRelease: boolean
  allowBetaFirmware: boolean
  bridgeApiPort: number
}

export const AppSettings: FC = () => {
  const { settings } = useModal()
  const [appSettings, setAppSettings] = useState<AppSettingsProps>({
    shouldAutoLunch: true,
    shouldAutoStartBridge: true,
    shouldMinimizeToTray: true,
    shouldAutoUpdate: true,
    allowPreRelease: false,
    allowBetaFirmware: false,
    bridgeApiPort: 1646,
  })

  const [prevAppSettings, setPrevAppSettings] = useState<AppSettingsProps>(appSettings)

  useEffect(() => {
    ipcRenderer.on('@app/settings', (_event: any, data: any) => {
      // console.log('APP SETTINGS RECIEVED', data)
      setAppSettings(data)
    })
  }, [])

  useEffect(() => {
    if (
      prevAppSettings &&
      appSettings.shouldAutoLunch === prevAppSettings.shouldAutoLunch &&
      appSettings.shouldAutoUpdate === prevAppSettings.shouldAutoUpdate &&
      appSettings.shouldMinimizeToTray === prevAppSettings.shouldMinimizeToTray &&
      appSettings.allowPreRelease === prevAppSettings.allowPreRelease &&
      appSettings.allowBetaFirmware === prevAppSettings.allowBetaFirmware
    )
      return
    setPrevAppSettings(appSettings)
    // console.log('APP SETTINGS SAVED')
    ipcRenderer.send('@app/update-settings', appSettings)
  }, [appSettings, prevAppSettings])

  useEffect(() => {
    if (settings.isOpen) ipcRenderer.send('@app/settings')
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
              shouldAutoLunch: !currentSettings.shouldAutoLunch,
            }
          })
        }}
        icon={<Icon as={FaRocket} color='gray.500' />}
      >
        <Switch isChecked={appSettings.shouldAutoLunch} pointerEvents='none' />
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
    </Stack>
  )
}
