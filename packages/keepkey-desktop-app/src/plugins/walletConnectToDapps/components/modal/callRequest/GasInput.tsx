import { NumberInput, NumberInputField, SimpleGrid } from '@chakra-ui/react'
import {
  Box,
  Divider,
  FormControl,
  HStack,
  Radio,
  RadioGroup,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import type { GasFeeDataEstimate } from '@shapeshiftoss/chain-adapters'
import type { ethereum } from '@shapeshiftoss/chain-adapters'
import { FeeDataKey } from '@shapeshiftoss/chain-adapters'
import { KnownChainIds } from '@shapeshiftoss/types'
import { HelperTooltip } from 'components/HelperTooltip/HelperTooltip'
import { getFeeTranslation } from 'components/Modals/Send/TxFeeRadioGroup'
import { RawText, Text } from 'components/Text'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { getPioneerClient } from 'lib/getPioneerClient'
import { logger } from 'lib/logger'
import { fromBaseUnit } from 'lib/math'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Fragment, useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslate } from 'react-polyglot'

import type { TxData } from './SendTransactionConfirmation'

type GasInputProps = {
  setSelectedGasPrice: (gasPrice: string) => void
  recommendedGasPriceData?: {
    maxFeePerGas: string
    maxPriorityFeePerGas: string
  }
  gasLimit?: string
}

const moduleLogger = logger.child({ namespace: 'GasInput' })

export const GasInput: FC<GasInputProps> = ({
  recommendedGasPriceData,
  setSelectedGasPrice,
  gasLimit = '250000',
}) => {
  const { setValue } = useFormContext<TxData>()
  const { requests } = useWalletConnect()
  const currentRequest = requests[0]
  const { params } = currentRequest
  // const { request, chainId: chainIdString } = params
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const bgColor = useColorModeValue('white', 'gray.850')
  const translate = useTranslate()
  const [gasRecomendedByDapp, setGasRecomendedByDapp] = useState<string | undefined>(undefined)
  const [gasRecomendedByPioneer, setGasRecomendedByPioneer] = useState<string | undefined>(
    undefined,
  )
  const [customGasPrice, setCustomGasPrice] = useState<string | undefined>(undefined)
  //const [gasFeeData, setGasFeeData] = useState<GasFeeDataEstimate | undefined>(undefined)

  const currentFeeAmount = useWatch({ name: 'currentFeeAmount' })

  useEffect(() => {
    // Define an asynchronous function
    const fetchData = async () => {
      console.log('params: ', params)
      const chainId = params.chainId.replace('eip155:', '')
      console.log('chainId: ', chainId)

      // Handle gas
      let gasRecomendedByDapp = params.request.params[0].gas
      let gasInDecimal = parseInt(gasRecomendedByDapp, 16)
      gasInDecimal = gasInDecimal / 1e9
      console.log('gasInDecimal: ', gasInDecimal)
      setGasRecomendedByDapp(gasInDecimal.toString())

      // Fetch additional data
      const pioneer = await getPioneerClient()
      let sanitizedChainId = typeof chainId === 'string' ? chainId.replace(/[^0-9]/g, '') : ''
      let caip = sanitizedChainId ? `eip155:${sanitizedChainId}/slip44:60` : null
      console.log('caip: ', caip)
      let recomendedFeeFromPioneer = await pioneer.GetFeeInfoByCaip({ caip })
      console.log('recomendedFeeFromPioneer: ', recomendedFeeFromPioneer)
      // Convert gas price from BigNumber to Gwei
      let gasPriceHex = recomendedFeeFromPioneer.data.gasPrice.hex
      let gasPriceInWei = parseInt(gasPriceHex, 16)
      let gasPriceInGwei = gasPriceInWei / 1e9
      console.log('Gas price in Gwei: ', gasPriceInGwei)
      setGasRecomendedByPioneer(gasPriceInGwei)
      setSelectedGasPrice(gasRecomendedByPioneer)
    }

    // Invoke the asynchronous function
    fetchData()
  }, [])

  const options = [
    {
      identifier: 'dapp',
      value: gasRecomendedByDapp,
      label: 'Recommended by Dapp',
      duration: '',
      amount: gasRecomendedByDapp,
      color: 'yellow.200',
    },
    {
      identifier: 'pioneer',
      value: gasRecomendedByPioneer,
      label: 'Recommended by Pioneer',
      duration: '',
      amount: gasRecomendedByPioneer,
      color: 'green.200',
    },
    {
      identifier: 'custom',
      value: customGasPrice,
      label: 'set by user',
      duration: '',
      amount: customGasPrice,
      color: 'green.200',
    },
  ]

  const [currentRadioSelection, setCurrentRadioSelection] = useState('pioneer')

  const handleRadioChange = useCallback(
    (selection: string) => {
      console.log('Handling radio change to: ', selection)
      setCurrentRadioSelection(selection)
      if (selection === 'pioneer') {
        setSelectedGasPrice(gasRecomendedByPioneer)
      } else if (selection === 'dapp') {
        setSelectedGasPrice(gasRecomendedByDapp)
      } else if (selection === 'custom') {
        setSelectedGasPrice(customGasPrice)
      } else {
        throw new Error('unknown value')
      }
    },
    [gasRecomendedByDapp, gasRecomendedByPioneer, customGasPrice],
  )

  const gasFeeInputChange = useCallback((selection: string) => {
    console.log('Setting Gas price value: ', selection)
    setCurrentRadioSelection('custom') // Add this line
    setCustomGasPrice(selection)
    setSelectedGasPrice(selection)
  }, [])

  return (
    <FormControl
      borderWidth={1}
      borderColor={borderColor}
      bg={bgColor}
      borderRadius='xl'
      px={4}
      pt={2}
      pb={4}
    >
      <HStack justifyContent='space-between' mb={4}>
        <HelperTooltip label={translate('gasInput.gasPrice.tooltip')}>
          <Text color='gray.500' fontWeight='medium' translation='gasInput.gasPrice.label' />
        </HelperTooltip>
        {!!true && (
          <RawText fontWeight='medium'>{`${currentRadioSelection} ${currentFeeAmount}`}</RawText>
        )}
      </HStack>

      <Box borderWidth={1} borderRadius='lg' borderColor={borderColor}>
        <RadioGroup alignItems='stretch' value={currentRadioSelection} onChange={handleRadioChange}>
          <VStack spacing={0}>
            {options.map(option => (
              <Fragment key={option.value}>
                <HStack
                  alignItems='center'
                  fontWeight='medium'
                  width='full'
                  justifyContent='space-between'
                  px={4}
                  py={2}
                >
                  <Radio color='blue' value={option.identifier}>
                    <HStack>
                      <RawText>{option.label}</RawText>
                      <RawText color='gray.500' flex={1}>
                        {option.duration}
                      </RawText>
                    </HStack>
                  </Radio>
                  <RawText color={option.color}>{option.amount} (Gwei)</RawText>
                </HStack>
                <Divider />
              </Fragment>
            ))}
            <Box px={4} py={2} width='full'>
              <SimpleGrid
                mt={2}
                spacing={4}
                templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
              >
                <Box>
                  <HelperTooltip label={translate('gasInput.base.gasPrice')}>
                    <Text translation='gasInput.base.label' color='gray.500' fontWeight='medium' />
                  </HelperTooltip>
                  <NumberInput borderColor={borderColor} mt={2} onChange={gasFeeInputChange}>
                    <NumberInputField placeholder='Number...' />
                  </NumberInput>
                </Box>
                <Box></Box>
              </SimpleGrid>
            </Box>
          </VStack>
        </RadioGroup>
      </Box>
    </FormControl>
  )
}
