import { InfoIcon } from '@chakra-ui/icons'
import type { FlexProps } from '@chakra-ui/layout'
import { Box, Button, Divider, Flex, useColorModeValue } from '@chakra-ui/react'
import { Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import type Polyglot from 'node-polyglot'
import React from 'react'
import { useTranslate } from 'react-polyglot'

export type AwaitKeepKeyProps = {
  translation: string | null | [string, number | Polyglot.InterpolationOptions]
  children?: React.ReactNode
  onCancel?: () => Promise<void> | void
  noCancel?: boolean
  awaitingDeviceInteraction?: boolean
} & FlexProps

export const AwaitKeepKey = ({
  children,
  translation,
  onCancel,
  awaitingDeviceInteraction: propsAwaitingDeviceInteraction,
  noCancel,
  ...props
}: AwaitKeepKeyProps) => {
  const translate = useTranslate()
  const {
    setDeviceState,
    state: {
      deviceState: { awaitingDeviceInteraction: deviceStateAwaitingDeviceInteraction },
      wallet,
    },
  } = useWallet()
  const blueShade = useColorModeValue('blue.500', 'blue.200')

  const cancel = async () => {
    if (onCancel) {
      await onCancel()
    }
    setDeviceState({ awaitingDeviceInteraction: false })
    await wallet?.cancel()
  }

  return propsAwaitingDeviceInteraction ?? deviceStateAwaitingDeviceInteraction ? (
    <>
      <Divider />
      <Box p={3}>
        <Flex {...props}>
          <InfoIcon color={blueShade} mt={1} />
          <Box ml={3}>
            <Text translation={translation} mb={3} fontWeight='medium' color={blueShade} />
            {!noCancel && (
              <Button colorScheme='blue' variant='ghost-filled' onClick={cancel} size='sm'>
                {translate('common.cancel')}
              </Button>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  ) : (
    <>{children}</>
  )
}
