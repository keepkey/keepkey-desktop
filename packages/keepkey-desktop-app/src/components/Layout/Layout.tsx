import type { ContainerProps } from '@chakra-ui/react'
import { Container, Flex } from '@chakra-ui/react'
import React from 'react'

import { BottomNav } from './Header/BottomNav'
import { Header } from './Header/Header'
import { SideNav } from './Header/SideNav'

export const Layout: React.FC<ContainerProps> = ({ children, ...rest }) => {
  return (
    <>
      <Header />

      {/* <SideNav /> */}
      <Container
        as='main'
        maxWidth='full'
        width='full'
        marginInline='auto'
        paddingInlineStart='0'
        paddingInlineEnd='0'
        flex='1 1 0%'
        position={'relative'}
        paddingBottom={`env(safe-area-inset-top)`}
        {...rest}
      >
        <>{children}</>
      </Container>
      <BottomNav />
    </>
  )
}
