import { ChatIcon, SettingsIcon } from '@chakra-ui/icons'
import type { StackProps } from '@chakra-ui/react'
import { Flex, Link } from '@chakra-ui/react'
import { usePlugins } from 'context/PluginProvider/PluginProvider'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { union } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useTranslate } from 'react-polyglot'
import { Link as ReactRouterLink } from 'react-router-dom'
import type { Route } from 'Routes/helpers'
import { routes } from 'Routes/RoutesCommon'

import { MainNavLink } from './MainNavLink'

type NavBarProps = {
  isCompact?: boolean
  onClick?: () => void
} & StackProps

export const NavBar = ({ isCompact, onClick, ...rest }: NavBarProps) => {
  const translate = useTranslate()
  const { routes: pluginRoutes } = usePlugins()
  const { settings } = useModal()

  const {
    state: { wallet },
  } = useWallet()

  const handleClick = (onClick?: () => void) => {
    onClick && onClick()
  }

  const [supportsAuthenticator, setSupportsAuthenticator] = useState(false)

  const navItemGroups = useMemo(() => {
    const allRoutes = union(routes, pluginRoutes).filter(route => !route.disable && !route.hide)
    const groups = allRoutes.reduce(
      (entryMap, currentRoute) =>
        entryMap.set(currentRoute.category, [
          ...(entryMap.get(currentRoute.category) || []),
          currentRoute,
        ]),
      new Map(),
    )

    const entries = Array.from(groups.entries())

    const index = entries[1][1].findIndex((entry: any) => entry.path === '/authenticator')

    !supportsAuthenticator && entries[1][1].splice(index, 1)

    return entries
  }, [pluginRoutes, supportsAuthenticator])

  useEffect(() => {
    wallet?.getFirmwareVersion().then(version => {
      const [major, minor] = version.replace('v', '').split('.')
      if (Number(major) >= 7 && Number(minor) >= 6) setSupportsAuthenticator(true)
    })
  }, [wallet])

  return (
    <Flex width='full' flexDir='row' gap={6} {...rest}>
      {navItemGroups.map((group, _id) => {
        const [, values] = group
        return values.map((item: Route, id: number) => (
          <MainNavLink
            isCompact={isCompact}
            as={ReactRouterLink}
            key={id}
            leftIcon={item.icon}
            href={item.path}
            to={item.path}
            size='lg'
            onClick={onClick}
            label={translate(item.label)}
            aria-label={translate(item.label)}
            data-test={`navigation-${item.label.split('.')[1]}-button`}
          />
        ))
      })}
      <MainNavLink
        isCompact={isCompact}
        size='sm'
        onClick={() => handleClick(() => settings.open({}))}
        label={translate('common.settings')}
        leftIcon={<SettingsIcon />}
        data-test='navigation-settings-button'
      />
      <MainNavLink
        isCompact={isCompact}
        as={Link}
        isExternal
        size='sm'
        href='https://discord.gg/stfRnW3Jys'
        label={translate('common.joinDiscord')}
        leftIcon={<ChatIcon />}
        data-test='navigation-join-discord-button'
      />
      {/* {isYatFeatureEnabled && <YatBanner isCompact={isCompact} />} */}
    </Flex>
  )
}
