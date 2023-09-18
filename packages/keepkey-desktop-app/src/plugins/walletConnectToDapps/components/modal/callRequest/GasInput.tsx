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
import { logger } from 'lib/logger'
import { fromBaseUnit } from 'lib/math'
import type { FC } from 'react'
import { getPioneerClient } from 'lib/getPioneerClient'
import { useEffect, useState } from 'react'
import { Fragment, useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslate } from 'react-polyglot'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import type { TxData } from './SendTransactionConfirmation'

type GasInputProps = {
  recommendedGasPriceData?: {
    maxFeePerGas: string
    maxPriorityFeePerGas: string
  }
  gasLimit?: string
}

const moduleLogger = logger.child({ namespace: 'GasInput' })

export const GasInput: FC<GasInputProps> = ({ recommendedGasPriceData, gasLimit = '250000' }) => {
  const { setValue } = useFormContext<TxData>()
  const { requests, removeRequest, isConnected, dapp } = useWalletConnect()
  const currentRequest = requests[0] as SignClientTypes.EventArguments['session_request']
  const { topic, params, id } = currentRequest
  const { request, chainId: chainIdString } = params
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const bgColor = useColorModeValue('white', 'gray.850')
  const translate = useTranslate()
  const [gasRecomendedByDapp, setGasRecomendedByDapp] = useState<string | undefined>(undefined)
  const [gasRecomendedByPioneer, setGasRecomendedByPioneer] = useState<string | undefined>(undefined)
  const [gasFeeData, setGasFeeData] = useState<GasFeeDataEstimate | undefined>(undefined)

  const currentFeeAmount = useWatch({ name: 'currentFeeAmount' })

  useEffect(() => {
    // Define an asynchronous function
    const fetchData = async () => {
      console.log("params: ", params);
      const chainId = params.chainId.replace("eip155:", "");
      console.log("chainId: ", chainId);

      // Handle gas
      let gasRecomendedByDapp = params.request.params[0].gas;
      let gasInDecimal = parseInt(gasRecomendedByDapp, 16);
      gasInDecimal = gasInDecimal / 1e9;
      console.log("gasInDecimal: ", gasInDecimal);
      setGasRecomendedByDapp(gasInDecimal.toString());

      // Fetch additional data
      const pioneer = await getPioneerClient();
      let caip = "eip155:"+chainId+"/slip44:60";
      let recomendedFeeFromPioneer = await pioneer.GetFeeInfoByCaip({ caip });
      console.log("recomendedFeeFromPioneer: ", recomendedFeeFromPioneer);
      // Convert gas price from BigNumber to Gwei
      let gasPriceHex = recomendedFeeFromPioneer.data.gasPrice.hex;
      let gasPriceInWei = parseInt(gasPriceHex, 16);
      let gasPriceInGwei = gasPriceInWei / 1e9;
      console.log("Gas price in Gwei: ", gasPriceInGwei);
      setGasRecomendedByPioneer(gasPriceInGwei);
    };

    // Invoke the asynchronous function
    fetchData();
  }, []);

  // calculate fee amounts for each selection
  const amounts = useMemo(() => {
    const recommendedAmount = fromBaseUnit(
      bnOrZero(recommendedGasPriceData?.maxFeePerGas).times(gasLimit),
      18,
    ).toString()

    if (!gasFeeData || !recommendedGasPriceData) {
      return {
        recommended: recommendedAmount || '0',
        [FeeDataKey.Slow]: '0',
        [FeeDataKey.Average]: '0',
        [FeeDataKey.Fast]: '0',
      }
    }

    const slowData = gasFeeData[FeeDataKey.Average]
    const slowAmount = fromBaseUnit(bnOrZero(slowData?.maxFeePerGas).times(gasLimit), 18).toString()

    const averageData = gasFeeData[FeeDataKey.Average]
    const averageAmount = fromBaseUnit(
      bnOrZero(averageData?.maxFeePerGas).times(gasLimit),
      18,
    ).toString()

    const fastData = gasFeeData[FeeDataKey.Fast]
    const fastAmount = fromBaseUnit(bnOrZero(fastData?.maxFeePerGas).times(gasLimit), 18).toString()

    return {
      recommended: recommendedAmount,
      [FeeDataKey.Slow]: slowAmount,
      [FeeDataKey.Average]: averageAmount,
      [FeeDataKey.Fast]: fastAmount,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasFeeData, gasLimit, recommendedGasPriceData?.maxFeePerGas])

  const options = [
    {
      value: gasRecomendedByDapp,
      label: "Recommended by Dapp",
      duration: '',
      amount: gasRecomendedByDapp,
      color: 'green.200',
    },
    {
      value: gasRecomendedByPioneer,
      label: "Recommended by Pioneer",
      duration: '',
      amount: gasRecomendedByPioneer,
      color: 'green.200',
    },
    // {
    //   value: FeeDataKey.Average,
    //   label: translate(getFeeTranslation(FeeDataKey.Average)),
    //   duration: '',
    //   amount: amounts[FeeDataKey.Average],
    //   color: 'blue.200',
    // },
    // {
    //   value: FeeDataKey.Fast,
    //   label: translate(getFeeTranslation(FeeDataKey.Fast)),
    //   duration: '',
    //   amount: amounts[FeeDataKey.Fast],
    //   color: 'red.400',
    // },
  ]

  if (!!recommendedGasPriceData?.maxFeePerGas) {
    options.push({
      value: 'recommended' as FeeDataKey,
      label: 'Recommended',
      duration: '',
      amount: amounts.recommended,
      color: 'green.200',
    })
  }
  const [currentRadioSelection, setCurrentRadioSelection] = useState(
    !!recommendedGasPriceData?.maxFeePerGas ? 'recommended' : FeeDataKey.Fast,
  )

  const handleRadioChange = useCallback(
    (selection: string) => {
      setCurrentRadioSelection(selection)

      if (selection === 'recommended') {
        setValue('maxPriorityFeePerGas', recommendedGasPriceData?.maxPriorityFeePerGas!)
        setValue('maxFeePerGas', recommendedGasPriceData?.maxFeePerGas!)
      } else if (selection === FeeDataKey.Slow) {
        setValue('maxPriorityFeePerGas', gasFeeData?.slow?.maxPriorityFeePerGas!)
        setValue('maxFeePerGas', gasFeeData?.slow?.maxFeePerGas!)
      } else if (selection === FeeDataKey.Average) {
        setValue('maxPriorityFeePerGas', gasFeeData?.average?.maxPriorityFeePerGas!)
        setValue('maxFeePerGas', gasFeeData?.average?.maxFeePerGas!)
      } else if (selection === FeeDataKey.Fast) {
        setValue('maxPriorityFeePerGas', gasFeeData?.fast?.maxPriorityFeePerGas!)
        setValue('maxFeePerGas', gasFeeData?.fast?.maxFeePerGas!)
      } else {
        throw new Error('unknown value')
      }
    },
    [
      gasFeeData?.average?.maxPriorityFeePerGas,
      gasFeeData?.average?.maxFeePerGas,
      gasFeeData?.fast?.maxFeePerGas,
      gasFeeData?.fast?.maxPriorityFeePerGas,
      gasFeeData?.slow?.maxFeePerGas,
      gasFeeData?.slow?.maxPriorityFeePerGas,
      recommendedGasPriceData?.maxFeePerGas,
      recommendedGasPriceData?.maxPriorityFeePerGas,
      setValue,
    ],
  )

  const gasFeeInputChange = useCallback(
      (selection: string) => {
        setCurrentRadioSelection('custom')
        setValue('gasPrice', selection)
      },
      [setValue],
  )

  // const baseFeeInputChange = useCallback(
  //   (selection: string) => {
  //     setCurrentRadioSelection('custom')
  //     setValue('maxFeePerGas', selection)
  //   },
  //   [setValue],
  // )
  //
  // const priorityFeeInputChange = useCallback(
  //   (selection: string) => {
  //     setCurrentRadioSelection('custom')
  //     setValue('maxPriorityFeePerGas', selection)
  //   },
  //   [setValue],
  // )

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
                  <Radio color='blue' value={option.value}>
                    <HStack>
                      <RawText>{option.label}</RawText>
                      <RawText color='gray.500' flex={1}>
                        {option.duration}
                      </RawText>
                    </HStack>
                  </Radio>
                  <RawText color={option.color}>{option.amount}</RawText>
                </HStack>
                <Divider />
              </Fragment>
            ))}
            <Box px={4} py={2} width='full'>
              <HStack width='full'>
                <Radio color='blue' onClick={() => setCurrentRadioSelection('custom')}>
                  <Text translation='gasInput.custom' />
                </Radio>
              </HStack>
              <SimpleGrid
                mt={2}
                spacing={4}
                templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
              >
                <Box>
                  <HelperTooltip label={translate('gasInput.base.tooltip')}>
                    <Text translation='gasInput.base.label' color='gray.500' fontWeight='medium' />
                  </HelperTooltip>
                  <NumberInput borderColor={borderColor} mt={2} onChange={gasFeeInputChange}>
                    <NumberInputField placeholder='Number...' />
                  </NumberInput>
                </Box>
                <Box>

                {/*  <HelperTooltip label={translate('gasInput.base.tooltip')}>*/}
                {/*    <Text translation='gasInput.base.label' color='gray.500' fontWeight='medium' />*/}
                {/*  </HelperTooltip>*/}
                {/*  <NumberInput borderColor={borderColor} mt={2} onChange={baseFeeInputChange}>*/}
                {/*    <NumberInputField placeholder='Number...' />*/}
                {/*  </NumberInput>*/}
                {/*</Box>*/}
                {/*<Box>*/}
                {/*  <HelperTooltip label={translate('gasInput.priority.tooltip')}>*/}
                {/*    <Text*/}
                {/*      translation='gasInput.priority.label'*/}
                {/*      color='gray.500'*/}
                {/*      fontWeight='medium'*/}
                {/*    />*/}
                {/*  </HelperTooltip>*/}
                {/*  <NumberInput borderColor={borderColor} mt={2} onChange={priorityFeeInputChange}>*/}
                {/*    <NumberInputField placeholder='Number...' />*/}
                {/*  </NumberInput>*/}
                </Box>
              </SimpleGrid>
            </Box>
          </VStack>
        </RadioGroup>
      </Box>
    </FormControl>
  )
}
