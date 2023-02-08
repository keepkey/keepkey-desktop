// import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Box, Textarea } from '@chakra-ui/react'
// import { Text } from 'components/Text'
// import { getPioneerClient } from 'lib/getPioneerClient'
// import { logger } from 'lib/logger'
import { useContract } from 'plugins/walletConnectToDapps/ContractABIContext'
// import type { JSXElementConstructor, Key, ReactElement, ReactFragment, ReactPortal } from 'react'
import { useEffect, useState } from 'react'
import { FaCode } from 'react-icons/fa'
import { useTranslate } from 'react-polyglot'

import { Text } from '../../../../../components/Text'
import { ModalSection } from './ModalSection'

// const moduleLogger = logger.child({ namespace: 'ContractRaw' })

export const TransactionRaw = ({ request }: { request: any }) => {
  const translate = useTranslate()

  const { contract } = useContract(request?.params[0].to)

  // const [transaction, setTransaction] = useState<any>(undefined)
  const [rawHex, setRawHex] = useState<any>(undefined)
  const [to, setTo] = useState<any>(undefined)
  const [from, setFrom] = useState<any>(undefined)

  useEffect(() => {
    ;(async () => {
      console.log('request: ', request)
      setRawHex(request?.params[0].data)
      setTo(request?.params[0].to)
      setFrom(request?.params[0].from)
    })()
  }, [request, contract])

  // const copyToClipboard = (text: string) => {
  //   navigator.clipboard.writeText(text)
  // }

  return (
    <ModalSection
      title={translate('plugins.walletConnectToDapps.modal.sendTransaction.raw.raw')}
      icon={<FaCode />}
    >
      <Box pl={6} pt={2}>
        <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.raw.to'></Text>
        <Textarea
          value={to}
          isReadOnly
          size='lg'
          style={{ width: '100%', height: '50px', overflowY: 'scroll' }}
        />
      </Box>
      <Box pl={6} pt={2}>
        <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.raw.from'></Text>
        <Textarea
          value={from}
          isReadOnly
          size='lg'
          style={{ width: '100%', height: '50px', overflowY: 'scroll' }}
        />
      </Box>
      <Box pl={6} pt={2}>
        <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.raw.data'></Text>
        <Textarea
          value={rawHex}
          isReadOnly
          placeholder={translate(
            'plugins.walletConnectToDapps.modal.sendTransaction.rawHexPlaceholder',
          )}
          size='lg'
          style={{ width: '100%', height: '200px', overflowY: 'scroll' }}
        />
      </Box>
    </ModalSection>
  )
}
