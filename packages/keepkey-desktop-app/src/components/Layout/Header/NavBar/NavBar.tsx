import { ChatIcon, SettingsIcon } from '@chakra-ui/icons'
import type { StackProps } from '@chakra-ui/react'
import { Flex, Link, Tooltip, Button } from '@chakra-ui/react'
import { usePlugins } from 'context/PluginProvider/PluginProvider'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { union } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useTranslate } from 'react-polyglot'
import { Link as ReactRouterLink } from 'react-router-dom'
import type { Route, RouteCategory } from 'Routes/helpers'
import { routes } from 'Routes/RoutesCommon'
import * as semver from 'semver'
import { WalletActions } from 'context/WalletProvider/actions'

import { MainNavLink } from './MainNavLink'

type NavBarProps = {
  isCompact?: boolean
  onClick?: () => void
} & StackProps

export const NavBar = ({ isCompact, onClick, ...rest }: NavBarProps) => {
  const { dispatch } = useWallet()
  const translate = useTranslate()
  const { routes: pluginRoutes } = usePlugins()
  const { settings } = useModal()

  const {
    state: { wallet },
  } = useWallet()

  const [supportsAuthenticator, setSupportsAuthenticator] = useState(false)

  const navItemGroups = useMemo(() => {
    const allRoutes = union(routes, pluginRoutes).filter(route => !route.disable && !route.hide)
    const groups = allRoutes.reduce((entryMap, currentRoute) => {
      if (!entryMap.has(currentRoute.category)) entryMap.set(currentRoute.category, [])
      entryMap.get(currentRoute.category)!.push(currentRoute)
      return entryMap
    }, new Map<RouteCategory | undefined, Route[]>())

    return Array.from(groups.entries())
  }, [pluginRoutes])

  useEffect(() => {
    wallet?.getFirmwareVersion().then(version => {
      setSupportsAuthenticator(semver.gte(version, '7.6.0'))
    })
  }, [wallet])
  
  let openSupport = () => {
    dispatch({ type: WalletActions.SET_BROWSER_URL, payload: 'https://keepkey-docs-o9qn.vercel.app/' })
    // history.push('/browser')
  }
  
  return (
    <Flex width='full' flexDir='row' gap={6} {...rest}>
      {navItemGroups.map((group, groupId) => {
        const [, values] = group
        return values
          .filter((route: Route) => !route.hide)
          .map((item: Route, itemId: number) => {
            const disabled = item.path === '/authenticator' && !supportsAuthenticator
            return (
              <MainNavLink
                isCompact={isCompact}
                as={!disabled ? ReactRouterLink : undefined}
                key={`${groupId}-${itemId}`}
                leftIcon={item.icon}
                href={item.path}
                to={item.path}
                size='lg'
                onClick={onClick}
                label={translate(item.label)}
                disabled={disabled}
                aria-label={translate(item.label)}
                data-test={`navigation-${item.label.split('.')[1]}-button`}
              />
            )
          })
      })}
      <MainNavLink
        isCompact={isCompact}
        size='sm'
        onClick={() => settings.open({})}
        label={translate('common.settings')}
        leftIcon={<SettingsIcon />}
        data-test='navigation-settings-button'
      />
      {/*<MainNavLink*/}
      {/*  isCompact={isCompact}*/}
      {/*  as={Link}*/}
      {/*  isExternal*/}
      {/*  size='sm'*/}
      {/*  href='https://discord.gg/P7Yw8gHUhn'*/}
      {/*  label={translate('common.joinDiscord')}*/}
      {/*  leftIcon={<ChatIcon />}*/}
      {/*  data-test='navigation-join-discord-button'*/}
      {/*/>*/}

      {/*<Tooltip label='support' placement='top'>*/}
      {/*  <Button*/}
      {/*      onClick={openSupport()}*/}
      {/*      width='full'*/}
      {/*      justifyContent={'center'}*/}
      {/*      variant='nav-link'*/}
      {/*      isActive={false}*/}
      {/*      minWidth={'auto'}*/}
      {/*  >*/}
      {/*    <ChatIcon />*/}
      {/*  </Button>*/}
      {/*</Tooltip>*/}
      
      {/*<MainNavLink*/}
      {/*    size='sm'*/}
      {/*    onClick={openSupport()}*/}
      {/*    label={translate('common.joinDiscord')}*/}
      {/*    leftIcon={<ChatIcon />}*/}
      {/*    data-test='navigation-join-discord-button'*/}
      {/*/>*/}
    </Flex>
  )
}
