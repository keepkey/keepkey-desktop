import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  ModalBody,
  ModalHeader,
  Switch,
  useColorModeValue,
} from '@chakra-ui/react'
import { deferred } from 'common-utils'
import type { RadioOption } from 'components/Radio/Radio'
import { Radio } from 'components/Radio/Radio'
import { Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import { useState } from 'react'
import { useTranslate } from 'react-polyglot'

import { FailureType, isKKFailureType } from '../../../../util'
import { useKeepKeyRecover } from '../hooks/useKeepKeyRecover'

const moduleLogger = logger.child({ namespace: ['KeepKeyRecoverySettings'] })

export const VALID_ENTROPY_NUMBERS = [128, 192, 256] as const
export const VALID_ENTROPY = VALID_ENTROPY_NUMBERS.map(entropy => entropy.toString())
export type Entropy = typeof VALID_ENTROPY[number]

export const sentenceLength = Object.freeze({
  TwelveWords: VALID_ENTROPY[0],
  EighteenWords: VALID_ENTROPY[1],
  TwentyFourWords: VALID_ENTROPY[2],
})

const sentenceLengthOptions: readonly RadioOption<Entropy>[] = Object.freeze([
  {
    value: sentenceLength.TwelveWords,
    label: ['modals.keepKey.recoverySettings.wordEntropy', { wordEntropy: '12' }],
  },
  {
    value: sentenceLength.EighteenWords,
    label: ['modals.keepKey.recoverySettings.wordEntropy', { wordEntropy: '18' }],
  },
  {
    value: sentenceLength.TwentyFourWords,
    label: ['modals.keepKey.recoverySettings.wordEntropy', { wordEntropy: '24' }],
  },
])

export const KeepKeyRecoverySettings = () => {
  const translate = useTranslate()
  const [useRecoveryPassphrase, setUseRecoveryPassphrase] = useState(false)
  const [sentenceLengthSelection, setSentenceLengthSelection] = useState<Entropy>(
    sentenceLength.TwelveWords,
  )
  const [loading, setLoading] = useState(false)

  const { dispatch } = useWallet()
  const recoverKeepKey = useKeepKeyRecover()

  const grayTextColor = useColorModeValue('gray.900', 'gray.400')
  const grayBackgroundColor = useColorModeValue('gray.100', 'gray.700')

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const labelDeferred = deferred<string>()
      dispatch({ type: WalletActions.OPEN_KEEPKEY_LABEL, payload: { deferred: labelDeferred } })
      const label = await labelDeferred
      while (true) {
        try {
          await recoverKeepKey({
            label,
            recoverWithPassphrase: useRecoveryPassphrase,
            recoveryEntropy: sentenceLengthSelection,
          })
        } catch (e) {
          if (isKKFailureType(e, FailureType.FAILURE_SYNTAXERROR)) {
            dispatch({ type: WalletActions.OPEN_KEEPKEY_RECOVERY_SYNTAX_FAILURE })
          } else if (isKKFailureType(e, FailureType.FAILURE_PINMISMATCH)) {
            continue
          } else {
            throw e
          }
        }
        break
      }
      dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: true })
    } catch (e) {
      moduleLogger.error(e, 'handleSubmit failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePassphraseToggle = () => setUseRecoveryPassphrase(current => !current)

  const radioButtonProps = {
    width: 'full',
    pt: 5,
    pb: 5,
    mb: 8,
    borderRadius: 'none',
    _first: {
      borderTopLeftRadius: 'lg',
      borderBottomLeftRadius: 'lg',
    },
    bg: grayBackgroundColor,
    color: grayTextColor,
    _last: {
      borderTopRightRadius: 'lg',
      borderBottomRightRadius: 'lg',
    },
    _checked: {
      bg: 'blue.500',
      color: 'white',
    },
  }

  const buttonGroupProps = {
    borderRadius: 'lg',
    display: 'flex',
    width: 'full',
    spacing: '0',
  }

  return (
    <>
      <ModalHeader>
        <Text translation={'modals.keepKey.recoverySettings.header'} />
      </ModalHeader>
      <ModalBody>
        <Text
          color={grayTextColor}
          fontWeight='bold'
          fontSize='md'
          translation={'modals.keepKey.recoverySettings.sentenceLengthLabel'}
          mb={2}
        />
        <Radio
          onChange={setSentenceLengthSelection}
          options={sentenceLengthOptions}
          defaultValue={sentenceLengthSelection}
          radioProps={radioButtonProps}
          buttonGroupProps={buttonGroupProps}
        />
        <Text
          color={grayTextColor}
          fontWeight='bold'
          fontSize='md'
          translation={'modals.keepKey.recoverySettings.recoveryPassphraseLabel'}
          mb={2}
        />
        <FormControl
          display='flex'
          alignItems='center'
          mb={3}
          background={grayBackgroundColor}
          padding={3}
          borderRadius='lg'
        >
          <Flex flexGrow={1}>
            <FormLabel color={grayTextColor} htmlFor='recovery-passphrase' mb='0'>
              {translate('modals.keepKey.recoverySettings.recoveryPassphraseToggle')}
            </FormLabel>
          </Flex>
          <Switch
            id='pin-caching'
            isChecked={useRecoveryPassphrase}
            onChange={handlePassphraseToggle}
          />
        </FormControl>
        <Text
          color={grayTextColor}
          fontWeight='medium'
          fontSize='sm'
          translation={'modals.keepKey.recoverySettings.recoveryPassphraseDescription'}
          mb={6}
        />
        <Button
          width='full'
          size='lg'
          colorScheme='blue'
          onClick={handleSubmit}
          isLoading={loading}
          mb={3}
        >
          <Text translation={'modals.keepKey.recoverySettings.button'} />
        </Button>
      </ModalBody>
    </>
  )
}
