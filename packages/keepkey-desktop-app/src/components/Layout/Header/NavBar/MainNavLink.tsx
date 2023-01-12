import type { ButtonProps } from '@chakra-ui/react'
import { Box, Button, forwardRef, Tooltip, useMediaQuery } from '@chakra-ui/react'
import { memo } from 'react'
import type { NavLinkProps } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { breakpoints } from 'theme/theme'

type SidebarLinkProps = {
  href?: string
  label: string
  children?: React.ReactNode
  to?: NavLinkProps['to']
  isCompact?: boolean
} & ButtonProps

export const MainNavLink = memo(
  forwardRef<SidebarLinkProps, 'div'>(({ isCompact = true, ...rest }: SidebarLinkProps, ref) => {
    const { href, label } = rest
    const location = useLocation()
    const active = location?.pathname.includes(href ?? '')
    return (
      <Tooltip label={label} placement='top'>
        <Button
          width='full'
          justifyContent={'center'}
          variant='nav-link'
          isActive={href ? active : false}
          minWidth={'auto'}
          ref={ref}
          {...rest}
        />
      </Tooltip>
    )
  }),
)
