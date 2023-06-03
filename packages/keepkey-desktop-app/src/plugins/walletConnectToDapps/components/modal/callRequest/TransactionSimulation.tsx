// import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Box, Spinner } from '@chakra-ui/react'
// import { Text } from 'components/Text'
import { getPioneerClient } from 'lib/getPioneerClient'
import { logger } from 'lib/logger'
import { useContract } from 'plugins/walletConnectToDapps/ContractABIContext'
// import type { JSXElementConstructor, Key, ReactElement, ReactFragment, ReactPortal } from 'react'
import { useEffect, useState } from 'react'
import { FaCode } from 'react-icons/fa'
import { useTranslate } from 'react-polyglot'

import { ModalSection } from './ModalSection'

const moduleLogger = logger.child({ namespace: 'ContractInteractionBreakdown' })

export const TransactionSimulation = ({ request }: { request: any }) => {
  const translate = useTranslate()

  const { contract } = useContract(request?.params[0].to)

  const [transaction, setTransaction] = useState<any>(undefined)
  const [simulation, setSimulation] = useState<any>(undefined)

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
          let simulation = await pioneer.Simulation('', tx)
          console.log('simulation: ', simulation.data)
          setSimulation(simulation.data)
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
  }, [request, contract, simulation])

  // helper function
  // function getColor(line: any) {
  //   const colorMap: any = {
  //     '}': '#24292e',
  //     '{': '#24292e',
  //     ',': '#24292e',
  //     ':': '#f95d6a',
  //   }
  //   return colorMap[line.trim()] || '#d6deeb'
  // }

  return (
    <ModalSection
      title={
        transaction?.name ??
        translate(
          'plugins.walletConnectToDapps.modal.sendTransaction.contractInteraction.sendingEth',
        )
      }
      icon={<FaCode />}
    >
      <Box pl={6} pt={2}>
        {simulation ? (
          <Box overflow='auto' style={{ whiteSpace: 'pre' }}>
            {/*{simulation}*/}
            {/*{JSON.parse(simulation, null, 2)*/}
            {/*  .split('\n')*/}
            {/*  .map(*/}
            {/*    (*/}
            {/*      line:*/}
            {/*        | string*/}
            {/*        | number*/}
            {/*        | boolean*/}
            {/*        | ReactElement<any, string | JSXElementConstructor<any>>*/}
            {/*        | ReactFragment*/}
            {/*        | ReactPortal*/}
            {/*        | null*/}
            {/*        | undefined,*/}
            {/*      i: Key | null | undefined,*/}
            {/*    ) => (*/}
            {/*      <div style={{ color: getColor(line) }} key={i}>*/}
            {/*        {line}*/}
            {/*      </div>*/}
            {/*    ),*/}
            {/*  )}*/}
          </Box>
        ) : (
          <Spinner />
        )}
      </Box>
    </ModalSection>
  )
}
