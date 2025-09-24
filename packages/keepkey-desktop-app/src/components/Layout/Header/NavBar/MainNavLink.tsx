import type { ButtonProps } from '@chakra-ui/react'
import { Button, forwardRef, Tooltip } from '@chakra-ui/react'
import { memo } from 'react'
import type { NavLinkProps } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

type SidebarLinkProps = {
  href?: string
  label: string
  children?: React.ReactNode
  to?: NavLinkProps['to']
  isCompact?: boolean
} & ButtonProps

export const MainNavLink = memo(
  forwardRef<SidebarLinkProps, 'div'>(
    ({ isCompact = true, leftIcon, ...rest }: SidebarLinkProps, ref) => {
      const { href, label } = rest
      const location = useLocation()
      const active = location?.pathname.includes(href ?? '')

      // For non-compact mode (horizontal navigation), show icon and label
      if (!isCompact) {
        return (
          <Button
            width='auto'
            justifyContent='flex-start'
            variant='nav-link'
            isActive={href ? active : false}
            minWidth='auto'
            leftIcon={leftIcon}
            ref={ref}
            {...rest}
          >
            {label}
          </Button>
        )
      }

      // For compact mode (vertical navigation), show only icon with tooltip
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
          >
            {leftIcon}
          </Button>
        </Tooltip>
      )
    },
  ),
)
