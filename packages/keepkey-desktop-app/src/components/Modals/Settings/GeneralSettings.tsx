import { ExternalLinkIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Divider, Flex, Stack } from '@chakra-ui/layout'
import { Icon, Switch, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { getLocaleLabel } from 'assets/translations/utils'
import { RawText } from 'components/Text'
import { FaCoins, FaDollarSign, FaGreaterThanEqual } from 'react-icons/fa'
import { MdChevronRight, MdLanguage } from 'react-icons/md'
import { Link } from 'react-router-dom'
import {
  selectCurrencyFormat,
  selectSelectedCurrency,
  selectSelectedLocale,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { BalanceThresholdInput } from './BalanceThresholdInput'
import { currencyFormatsRepresenter, SettingsRoutes } from './SettingsCommon'
import type { SettingsListProps } from './SettingsList'
import { SettingsListItem } from './SettingsListItem'

export const GeneralSettings = ({ appHistory, ...routeProps }: SettingsListProps) => {
  const { toggleColorMode } = useColorMode()
  const isLightMode = useColorModeValue(true, false)
  const selectedLocale = useAppSelector(selectSelectedLocale)
  const selectedCurrency = useAppSelector(selectSelectedCurrency)
  const selectedCurrencyFormat = useAppSelector(selectCurrencyFormat)
  // for both locale and currency
  const selectedPreferenceValueColor = useColorModeValue('blue.500', 'blue.200')

  return (
    <Stack width='full' p={0}>
      <Divider my={1} />
      <SettingsListItem
        label={isLightMode ? 'common.lightTheme' : 'common.darkTheme'}
        onClick={toggleColorMode}
        icon={<Icon as={isLightMode ? SunIcon : MoonIcon} color='gray.500' />}
      >
        <Switch isChecked={isLightMode} pointerEvents='none' />
      </SettingsListItem>
      <Divider my={1} />
      <>
        <SettingsListItem
          label='modals.settings.currency'
          onClick={() => routeProps.history.push(SettingsRoutes.FiatCurrencies)}
          icon={<Icon as={FaCoins} color='gray.500' />}
        >
          <Flex alignItems='center'>
            <RawText color={selectedPreferenceValueColor} lineHeight={1} fontSize='sm'>
              {selectedCurrency}
            </RawText>
            <MdChevronRight color='gray.500' size='1.5em' />
          </Flex>
        </SettingsListItem>
        <Divider my={1} />
        <SettingsListItem
          label='modals.settings.currencyFormat'
          onClick={() => routeProps.history.push(SettingsRoutes.CurrencyFormat)}
          icon={<Icon as={FaDollarSign} color='gray.500' />}
        >
          <Flex alignItems='center'>
            <RawText color={selectedPreferenceValueColor} lineHeight={1} fontSize='sm'>
              {currencyFormatsRepresenter[selectedCurrencyFormat]}
            </RawText>
            <MdChevronRight color='gray.500' size='1.5em' />
          </Flex>
        </SettingsListItem>
        <Divider my={1} />
      </>
      <SettingsListItem
        label='modals.settings.language'
        onClick={() => routeProps.history.push(SettingsRoutes.Languages)}
        icon={<Icon as={MdLanguage} color='gray.500' />}
      >
        <Flex alignItems='center'>
          <RawText color={selectedPreferenceValueColor} lineHeight={1} fontSize='sm'>
            {getLocaleLabel(selectedLocale)}
          </RawText>
          <MdChevronRight color='gray.500' size='1.5em' />
        </Flex>
      </SettingsListItem>
      <Divider my={1} />
      <SettingsListItem
        label='modals.settings.balanceThreshold'
        icon={<Icon as={FaGreaterThanEqual} color='gray.500' />}
        tooltipText='modals.settings.balanceThresholdTooltip'
      >
        <BalanceThresholdInput />
      </SettingsListItem>
      <Divider my={1} />
      <Link to={{ pathname: 'http://localhost:1646/docs' }} target='_blank'>
        <SettingsListItem
          icon={<Icon as={ExternalLinkIcon} color='gray.500' />}
          label='connectWallet.menu.openDev'
        />
      </Link>
      <Divider my={1} />
    </Stack>
  )
}
