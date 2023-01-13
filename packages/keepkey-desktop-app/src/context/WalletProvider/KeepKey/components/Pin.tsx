import type { ButtonProps, SimpleGridProps } from '@chakra-ui/react'
import { Alert, AlertDescription, AlertIcon, Button, Input, SimpleGrid } from '@chakra-ui/react'
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
  const [isPinEmpty, setIsPinEmpty] = useState(true)
  const {
    setDeviceState,
    state: {
      deviceState: { disposition },
      pinDeferred,
    },
    dispatch,
  } = useWallet()

  const pinFieldRef = useRef<HTMLInputElement | null>(null)

  const pinNumbers = [7, 8, 9, 4, 5, 6, 1, 2, 3]

  const handlePinPress = useCallback(
    (value: number) => {
      if (pinFieldRef?.current) {
        pinFieldRef.current.value += value.toString()
      }
    },
    [pinFieldRef],
  )

  const handleSubmit = async () => {
    setError(null)
    if (translationType !== 'remove')
      setDeviceState({
        isDeviceLoading: true,
      })
    setLoading(true)
    const pin = pinFieldRef.current?.value
    if (pin && pin.length > 0) {
      try {
        // The event handler will pick up the response to the sendPin request
        moduleLogger.debug('About to send pin')
        await pinDeferred?.resolve(pin)
        moduleLogger.debug('done sending pin')
        if (translationType === 'remove') return setLoading(false)
        switch (disposition) {
          case 'recovering':
            setDeviceState({ awaitingDeviceInteraction: true })
            dispatch({
              type: WalletActions.OPEN_KEEPKEY_CHARACTER_REQUEST,
              payload: {
                characterPos: undefined,
                wordPos: undefined,
              },
            })
            break
          default:
            // @ts-ignore
            moduleLogger.debug('disposition: ', disposition)
            //
            break
        }
      } catch (e) {
        moduleLogger.error(e, 'KeepKey PIN Submit error: ')
        pinDeferred?.reject(e)
      } finally {
        if (pinFieldRef?.current) {
          pinFieldRef.current.value = ''
        }
        setLoading(false)
      }
    }
  }

  const handleKeyboardInput = (e: KeyboardEvent) => {
    // We can't allow tabbing between inputs or the focused element gets out of sync with the KeepKey
    if (e.key === 'Tab') e.preventDefault()

    if (e.key === 'Backspace') {
      console.log('Backspace pressed')
      //@TODO remove last .splice(0,-1)
    }

    if (e.key === 'Enter') {
      handleSubmit()
      return
    }

    if (!pinNumbers.includes(Number(e.key))) {
      e.preventDefault()
      return
    } else {
      e.preventDefault()
      handlePinPress(Number(e.key))
      return
    }
  }

  // useEffect(() => {
  //   switch (pinError) {
  //     case undefined:
  //       setError(null)
  //       break
  //     // Device has a programmed PIN
  //     case FailureType.PININVALID:
  //       setError(`walletProvider.keepKey.errors.pinInvalid`)
  //       break
  //     // A "cancel" command was sent while showing the PIN screen on the KK
  //     case FailureType.PINCANCELLED:
  //       setError(`walletProvider.keepKey.errors.pinCancelled`)
  //       break
  //     // Creating a NEW PIN, the user didn't enter the same PIN in steps 1 and 2
  //     case FailureType.PINMISMATCH:
  //       setError(`walletProvider.keepKey.errors.pinMismatch`)
  //       break
  //     default:
  //       setError('walletProvider.keepKey.errors.unknown')
  //   }
  // }, [pinError])
  const [disablePin, setDisablePin] = useState(true)

  useEffect(() => {
    pinFieldRef.current?.focus()
    setTimeout(() => {
      setDisablePin(false)
    }, 1)
  }, [disablePin])

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
              setIsPinEmpty(!pinFieldRef.current?.value)
            }}
            {...buttonsProps}
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
        onKeyDown={handleKeyboardInput}
        onKeyUp={() => setIsPinEmpty(!pinFieldRef.current?.value)}
      />
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
        disabled={loading || isPinEmpty}
      >
        <Text translation={`walletProvider.keepKey.${translationType}.button`} />
      </Button>
    </>
  )
}
