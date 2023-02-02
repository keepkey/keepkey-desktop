import { useToast } from '@chakra-ui/react'
import { logger } from 'lib/logger'
import { get, isError } from 'lodash'
import { useTranslate } from 'react-polyglot'

// TODO support more error types (non swapper errors)
export const ErrorTranslationMap: Record<string, string> = {
  '': 'trade.errors.generalError',
}

const getTranslationFromError = (error: unknown) => {
  if (isError(error)) {
    return ErrorTranslationMap[get(error, 'code') ?? ''] ?? 'common.generalError'
  }
  return 'common.generalError'
}

const moduleLogger = logger.child({ namespace: ['Error'] })

export const useErrorHandler = () => {
  const toast = useToast()
  const translate = useTranslate()

  const showErrorToast = (error: unknown) => {
    const description = translate(getTranslationFromError(error))

    moduleLogger.error(error, description)

    toast({
      title: translate('trade.errors.title'),
      description,
      status: 'error',
      duration: 9000,
      isClosable: true,
      position: 'top-right',
    })
  }

  return {
    showErrorToast,
  }
}
