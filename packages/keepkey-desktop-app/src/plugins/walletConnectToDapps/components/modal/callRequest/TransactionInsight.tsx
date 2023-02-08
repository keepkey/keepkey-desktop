import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Box, Spinner } from '@chakra-ui/react'
import { Text } from 'components/Text'
import { getPioneerClient } from 'lib/getPioneerClient'
import { logger } from 'lib/logger'
import { useContract } from 'plugins/walletConnectToDapps/ContractABIContext'
import { useEffect, useState } from 'react'
import { FaCode } from 'react-icons/fa'
import { useTranslate } from 'react-polyglot'

import { ModalSection } from './ModalSection'

const moduleLogger = logger.child({ namespace: 'ContractInteractionBreakdown' })

export const TransactionInsight = ({ request }: { request: any }) => {
  const translate = useTranslate()

  const { contract } = useContract(request?.params[0].to)

  const [transaction, setTransaction] = useState<any>(undefined)
  const [insight, setInsight] = useState<any>(undefined)

  useEffect(() => {
    ;(async () => {
      try {
        console.log('request: ', request)
        console.log('request: ', request?.params)
        const pioneer = await getPioneerClient()
        if (request?.params[0].to && request?.params[0].from && request?.params[0].data) {
          const tx = {
            to: request?.params[0].to,
            from: request?.params[0].from,
            data: request?.params[0].data,
          }
          let insight = await pioneer.SmartInsight('', tx)
          console.log('insight: ', insight)
          setInsight(insight.data)
        }

        setTransaction(
          contract?.parseTransaction({
            data: request?.params[0].data,
            value: request?.params[0].value,
          }),
        )
      } catch (e) {
        moduleLogger.error(e, 'parseTransaction')
      }
    })()
  }, [request, contract])

  return (
    <ModalSection
      title={
        transaction?.name ??
        translate('plugins.walletConnectToDapps.modal.sendTransaction.insight.title')
      }
      icon={<FaCode />}
    >
      <Box pl={6} pt={2}>
        {insight && insight.tags ? (
          <div>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.isDangerousOperation'></Text>
              {insight.isDangerousOperation ? (
                <WarningTwoIcon style={{ color: 'red' }} />
              ) : (
                <CheckIcon color='green' />
              )}
              {insight.isDangerousOperation.toString()}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.isMaliciousAddress'></Text>
              {insight.isMaliciousAddress ? (
                <WarningTwoIcon style={{ color: 'red' }} />
              ) : (
                <CheckIcon color='green' />
              )}
              {insight.isMaliciousAddress.toString()}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.isTrustedAddress'>
                isTrustedAddress:
              </Text>
              {insight.isTrustedAddress ? (
                <CheckIcon color='green' />
              ) : (
                <WarningTwoIcon style={{ color: 'red' }} />
              )}
              {insight.isTrustedAddress.toString()}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              {insight?.tags?.THEFT ? (
                <>
                  <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.THEFT'>
                    THEFT:
                  </Text>
                  <WarningTwoIcon style={{ color: 'red' }} />
                </>
              ) : (
                <></>
              )}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              {insight?.tags?.CYBERCRIME ? (
                <>
                  <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.CYBERCRIME'>
                    CYBERCRIME:
                  </Text>
                  <WarningTwoIcon style={{ color: 'red' }} />
                </>
              ) : (
                <></>
              )}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              {insight?.tags?.SANCTIONED ? (
                <>
                  <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.isMaliciousAddress'>
                    SANCTIONED:
                  </Text>
                  <WarningTwoIcon style={{ color: 'red' }} />
                </>
              ) : (
                <></>
              )}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              {insight?.tags?.BOT ? (
                <>
                  <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.BOT'>
                    BOT:
                  </Text>
                  <WarningTwoIcon style={{ color: 'red' }} />
                </>
              ) : (
                <></>
              )}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              {insight?.tags?.WASH_TRADER ? (
                <>
                  <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.WASH_TRADER'>
                    WASH_TRADER:
                  </Text>
                  <WarningTwoIcon style={{ color: 'red' }} />
                </>
              ) : (
                <></>
              )}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              {insight?.tags?.MIXER ? (
                <>
                  <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.MIXER'>
                    MIXER:
                  </Text>
                  <WarningTwoIcon style={{ color: 'red' }} />
                </>
              ) : (
                <></>
              )}
            </Box>
            <Box p={2} display='flex' alignItems='center' justifyContent='space-between'>
              <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.insight.recommendedAction'></Text>
              <h4>{insight.recommendedAction}</h4>
            </Box>
          </div>
        ) : (
          <div>
            <Spinner
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='xl'
            />
          </div>
        )}
      </Box>
    </ModalSection>
  )
}
