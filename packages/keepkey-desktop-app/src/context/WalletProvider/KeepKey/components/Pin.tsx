import type { ButtonProps, SimpleGridProps } from '@chakra-ui/react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Center,
  Input,
  SimpleGrid,
} from '@chakra-ui/react'
import { CircleIcon } from 'components/Icons/Circle'
import { Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
// import { FailureType } from 'context/WalletProvider/KeepKey/KeepKeyTypes'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import type { KeyboardEvent } from 'react'
import { useCallback } from 'react'
import { useEffect, useRef, useState } from 'react'
const moduleLogger = logger.child({ namespace: ['Pin'] })

type KeepKeyPinProps = {
  translationType: string
  gridMaxWidth?: string | number
  confirmButtonSize?: string
  buttonsProps?: ButtonProps
  gridProps?: SimpleGridProps
}

export const KeepKeyPin = ({
  translationType,
  gridMaxWidth,
  confirmButtonSize,
  buttonsProps,
  gridProps,
}: KeepKeyPinProps) => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const {
    setDeviceState,
    state: { pinDeferred, showBackButton },
    dispatch,
  } = useWallet()
  const [pin, setPin] = useState<string>('')
  const pinFieldRef = useRef<HTMLInputElement | null>(null)

  const pinNumbers = [7, 8, 9, 4, 5, 6, 1, 2, 3]

  const handlePinPress = useCallback(
    (value: number) => {
      if (pin.length < 9) setPin(`${pin}${value}`)
    },
    [pin],
  )

  const handleSubmit = useCallback(async () => {
    setError(null)
    if (pin.length === 0) return

    // TODO: do we still need this?
    if (translationType !== 'remove') {
      setDeviceState({
        isDeviceLoading: true,
      })
    }

    try {
      setLoading(true)
      moduleLogger.debug('About to send PIN')
      await pinDeferred?.resolve(pin)
      moduleLogger.debug('Done sending PIN')
    } catch (e) {
      moduleLogger.error(e, 'KeepKey PIN Submit error: ')
      pinDeferred?.reject(e)
    } finally {
      setPin('')
      setLoading(false)
    }
  }, [pinDeferred, pin, setDeviceState, translationType])

  const handleKeyboardInput = (e: KeyboardEvent) => {
    e.preventDefault()

    if (e.key === 'Backspace') {
      setPin(pin.slice(0, -1))
    } else if (e.key === 'Enter') {
      handleSubmit()
    } else if (pinNumbers.includes(Number(e.key))) {
      handlePinPress(Number(e.key))
    }
  }

  const [disablePin, setDisablePin] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setDisablePin(false)
    }, 1)
  }, [disablePin])

  useEffect(() => {
    pinFieldRef.current?.focus()
  }, [])

  return (
    <>
      <Text color='gray.500' translation={`walletProvider.keepKey.${translationType}.body`} />
      <SimpleGrid
        columns={3}
        spacing={6}
        my={6}
        maxWidth={gridMaxWidth ?? '250px'}
        ml='auto'
        mr='auto'
        {...gridProps}
      >
        {pinNumbers.map(number => (
          <Button
            key={number}
            size={'lg'}
            p={8}
            onClick={() => {
              handlePinPress(number)
            }}
            {...buttonsProps}
            disabled={loading || pin.length >= 9}
          >
            <CircleIcon boxSize={4} />
          </Button>
        ))}
      </SimpleGrid>
      <Input
        type='password'
        ref={pinFieldRef}
        size='lg'
        variant='filled'
        mb={3}
        autoComplete='one-time-code'
        value={pin}
        autoFocus={true}
        onKeyDown={handleKeyboardInput}
        onSubmit={handleSubmit}
        disabled={loading}
      />
      {translationType === 'pin' && (
        <Center>
          <small>
            <Text
              onClick={() =>
                dispatch({
                  type: WalletActions.OPEN_KEEPKEY_WIPE,
                  payload: { preventClose: !showBackButton },
                })
              }
              translation={`walletProvider.keepKey.modals.headings.forgotPinWipeDevice`}
            />
          </small>
        </Center>
      )}
      {error && (
        <Alert status='error' mb={3} mt={3}>
          <AlertIcon />
          <AlertDescription>
            <Text translation={error} />
          </AlertDescription>
        </Alert>
      )}
      <Button
        mt={3}
        width='full'
        size={confirmButtonSize ?? 'lg'}
        colorScheme='blue'
        onClick={handleSubmit}
        disabled={loading || pin.length === 0}
      >
        <Text translation={`walletProvider.keepKey.${translationType}.button`} />
      </Button>
    </>
  )
}
