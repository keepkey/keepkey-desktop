import {
  Box,
  Button,
  Divider,
  FormControl,
  HStack,
  Image,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  SimpleGrid,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import type { BIP32Path } from '@keepkey/hdwallet-core'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import type { SignClientTypes } from '@walletconnect/types'
import { Card } from 'components/Card/Card'
import { HelperTooltip } from 'components/HelperTooltip/HelperTooltip'
import { KeepKeyIcon } from 'components/Icons/KeepKeyIcon'
import { RawText, Text } from 'components/Text'
import type { EthChainData } from 'context/WalletProvider/web3byChainId'
import { useWallet } from 'hooks/useWallet/useWallet'
import { WalletConnectWeb3Wallet } from 'kkdesktop/walletconnect/utils'
import { bn, bnOrZero } from 'lib/bignumber/bignumber'
import { getPioneerClient } from 'lib/getPioneerClient'
import { logger } from 'lib/logger'
import { EIP155_SIGNING_METHODS } from 'plugins/walletConnectToDapps/data/EIP115Data'
import { rejectEIP155Request } from 'plugins/walletConnectToDapps/utils/utils'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { Fragment, useCallback } from 'react'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { FaGasPump, FaWrench } from 'react-icons/fa'
import { useTranslate } from 'react-polyglot'

import { AddressSummaryCard } from './AddressSummaryCard'
import { ContractInteractionBreakdown } from './ContractInteractionBreakdown'
import { ModalSection } from './ModalSection'
import { TransactionAdvancedParameters } from './TransactionAdvancedParameters'

export type TxData = {
  nonce: string
  gasLimit: string
  gasPrice?: string
  maxPriorityFeePerGas: string
  maxFeePerGas: string
  data: string
  to: string
  value: string
}

export type EIP155SendTxConfirmFormContext = {
  nonce: string
  gasLimit: string
  maxPriorityFeePerGas: string
  maxFeePerGas: string
  currentFeeAmount: string
}

const moduleLogger = logger.child({ namespace: 'EIP155SendTransactionConfirmation' })

export const EIP155SendTransactionConfirmation = () => {
  const translate = useTranslate()
  const cardBg = useColorModeValue('white', 'gray.850')
  const {
    state: { wallet },
  } = useWallet()
  const toast = useToast()
  const { requests, removeRequest, isConnected, dapp } = useWalletConnect()
  const currentRequest = requests[0] as SignClientTypes.EventArguments['session_request']
  const { topic, params, id } = currentRequest
  const { request, chainId: chainIdString } = params
  const keepKeyWallet = wallet as KeepKeyHDWallet | null
  const [address, setAddress] = useState<string>()
  const [accountPath, setAccountPath] = useState<BIP32Path>()
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const bgColor = useColorModeValue('white', 'gray.850')
  const [pioneer, setPioneer] = useState(null)
  const [txData, setTxData] = useState(null)
  const [caip, setCaip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [loadingGas, setLoadingGas] = useState(true)
  const [loadingNonce, setLoadingNonce] = useState(true)
  const [loadingGasEstimate, setLoadingGasEstimate] = useState(true)
  const [loadingPriceData, setLoadingPriceData] = useState(true)
  const [loadingSigningInProgress, setLoadingSigningInProgress] = useState(false)
  const [selectedGasPrice, setSelectedGasPrice] = useState<string>()
  const [selectedGasPriceHex, setSelectedGasPriceHex] = useState<string>()
  const [legacyWeb3, setLegacyWeb3] = useState<EthChainData>()
  const [gasRecomendedByDapp, setGasRecomendedByDapp] = useState<string | undefined>(undefined)
  const [gasRecomendedByPioneer, setGasRecomendedByPioneer] = useState<string | undefined>(
    undefined,
  )
  const [customGasPrice, setCustomGasPrice] = useState<string | undefined>(undefined)
  const [currentFeeAmount, setCurrentFeeAmount] = useState<string | undefined>(undefined)
  const [currentFeeAmountUsd, setCurrentFeeAmountUsd] = useState<string | undefined>(undefined)
  const [recomendedNonce, setRecomendedNonce] = useState<string | undefined>(undefined)
  const [nativeBalance, setNativeBalance] = useState<string | undefined>(undefined)
  const [recomendedGasLimit, setRecomendedGasLimit] = useState<string | undefined>(undefined)
  const [chainId, setChainId] = useState<number>()

  const form = useForm({
    defaultValues: {
      nonce: '',
      gasLimit: '',
      gasPrice: '',
      maxPriorityFeePerGas: '',
      maxFeePerGas: '',
      currentFeeAmount: '',
    },
  })

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

  //default to pioneer
  //@TODO default to highest! (pioneer or dapp) add some kind of alert if dapp is wrong
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

  /*
      Get Gas Estimates
      get Nonce  Recomended
      (TODO) get TxHistory (last 5 txs) (for replacing txs)
   */

  function toPaddedHex(nonceStr: string) {
    // Convert string to integer
    const nonceInt = parseInt(nonceStr, 10)

    // Convert to hexadecimal string
    let hexNonce = nonceInt.toString(16)

    // Ensure it starts with '0x'
    if (!hexNonce.startsWith('0x')) {
      hexNonce = '0x' + hexNonce
    }

    return hexNonce
  }

  useEffect(() => {
    ;(async () => {
      if (!keepKeyWallet) return
      setLoadingAddress(true)
      let accountsOptions = [0, 1, 2, 3, 4, 5]
      for (let i = 0; i < accountsOptions.length; i++) {
        const accountPath = keepKeyWallet.ethGetAccountPaths({ coin: 'Ethereum', accountIdx: i })
        let address = await keepKeyWallet.ethGetAddress({
          addressNList: accountPath[0].addressNList,
          showDisplay: false,
        })
        if (address.toLowerCase() === params.request.params[0].from.toLowerCase()) {
          setAddress(address)
          setAccountPath(accountPath[0].addressNList)
          setLoadingAddress(false)
          return
        }
      }
    })().catch(e => moduleLogger.error(e))
  }, [keepKeyWallet, params])

  let onStart = async function () {
    try {
      const chainId = params.chainId.replace('eip155:', '')
      let sanitizedChainId = typeof chainId === 'string' ? chainId.replace(/[^0-9]/g, '') : ''
      let caip = sanitizedChainId ? `eip155:${sanitizedChainId}/slip44:60` : null
      setCaip(caip)

      // Handle gas from dapp
      let gasRecomendedByDapp = params.request.params[0].gas
      let gasInDecimal = parseInt(gasRecomendedByDapp, 16)
      gasInDecimal = gasInDecimal / 1e9
      setGasRecomendedByDapp(gasInDecimal.toString())

      //get gas from pioneer
      const pioneer = await getPioneerClient()
      setPioneer(pioneer)
      let recomendedFeeFromPioneer = await pioneer.GetFeeInfoByCaip({ caip })
      // Convert gas price from BigNumber to Gwei
      let gasPriceHex = recomendedFeeFromPioneer.data.gasPrice.hex
      let gasPriceInWei = parseInt(gasPriceHex, 16)
      let gasPriceInGwei = gasPriceInWei / 1e9
      console.log('pioneer: ', gasPriceInGwei, 'gwei')
      setGasRecomendedByPioneer(gasPriceInGwei)
      setSelectedGasPrice(gasPriceInGwei)

      //get nonce from pioneer
      if (caip && address) {
        let result = await pioneer.GetAddressInfoByCaip({ caip, address })
        if (result?.data?.nonce) setRecomendedNonce(result.data.nonce)
        if (result?.data?.balance) setNativeBalance(result.data.balance)

        //default txData
        const txDataInit: any = {
          addressNList: accountPath,
          chainId: toPaddedHex(chainId),
          data: params.request.params[0].data,
          gasLimit: toPaddedHex('500000'), //TODO get smart limit from pioneer
          to: params.request.params[0].to,
          value: params.request.params[0].value ?? '0x0',
          nonce: toPaddedHex(result.data.nonce.toString()),
        }
        console.log('txDataInit: ', txDataInit)
        //@TODO get txInsight from pioneer for recomended vaules

        setTxData(txDataInit)
      }
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    onStart()
  }, [keepKeyWallet, address])

  useEffect(() => {
    console.log('selectedGasPrice (in gwei): ', selectedGasPrice)
    if (selectedGasPrice) {
      // Convert from gwei to wei (1 gwei = 10^9 wei)
      const gasPriceInWei = bn(selectedGasPrice).multipliedBy(bn('1e9'))

      // Convert to hex
      const hexGasPrice = '0x' + gasPriceInWei.toString(16)

      console.log('Hex representation of selectedGasPrice (in wei): ', hexGasPrice)

      if (hexGasPrice) {
        setSelectedGasPriceHex(hexGasPrice)
        setLoadingGas(false)
        setLoadingPriceData(false)
      }
    }
    console.log('selectedGasPrice: ', selectedGasPrice)
    console.log('selectedGasPriceHex: ', selectedGasPriceHex)
  }, [selectedGasPrice])

  useEffect(() => {
    setLoading(
      loadingAddress ||
        loadingGas ||
        loadingNonce ||
        loadingGasEstimate ||
        loadingPriceData ||
        loadingSigningInProgress,
    )
  }, [
    loadingAddress,
    loadingGas,
    loadingNonce,
    loadingGasEstimate,
    loadingPriceData,
    loadingSigningInProgress,
  ])

  useEffect(() => {
    if (!chainIdString) return
    const chainIdRegexp = chainIdString.match(/^eip155:([0-9]+)$/)
    if (!chainIdRegexp) return
    setChainId(Number(chainIdRegexp[1]))
  }, [chainIdString])

  const onConfirm = async function () {
    try {
      if (!keepKeyWallet || !accountPath || !chainId) {
        if (!keepKeyWallet) console.log('no keepKeyWallet')
        if (!accountPath) console.log('no accountPath')
        if (!chainId) console.log('no chainId')
        return
      }
      setLoadingSigningInProgress(true)
      console.log('txData: ', txData)
      console.log('selectedGasPriceHex: ', selectedGasPriceHex)
      console.log('selectedGasPrice: ', selectedGasPrice)
      /*
            If custom gas selected use it
         */

      /*
           If custom nonce selected use it
         */

      //gas was recommended by the dapp
      if (!selectedGasPriceHex && params.request.params[0].gas) {
        console.log('No selected price was given! using dapps!')
        txData.gasPrice = params.request.params[0].gas
        delete txData.maxPriorityFeePerGas
        delete txData.maxFeePerGas
      } else if (selectedGasPriceHex) {
        console.log('useing selected gas without eip1555 not eth!')
        txData.gasPrice = selectedGasPriceHex
        console.log('selectedGasPriceHex: ', selectedGasPriceHex)
        delete txData.maxPriorityFeePerGas
        delete txData.maxFeePerGas
      } else {
        throw Error('unable to deturming gas price intent! aborting')
      }

      console.log('SIGN DATA', txData)
      if (!txData.gasPrice && !txData.maxPriorityFeePerGas && !txData.maxFeePerGas)
        throw Error('Invalid TX need gasPrice!')
      const response = await keepKeyWallet.ethSignTx(txData)
      console.log('RESPONSE', response)
      const signedTx = response?.serialized

      let jsonresponse = formatJsonRpcResult(id, signedTx)

      if (request.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION) {
        //broadcast tx
        let tx = {
          invocationId: '0x0',
          caip,
          serialized: response.serialized,
        }
        let broadcast = await pioneer.Broadcast(tx)
        broadcast = broadcast.data
        console.log('broadcast: ', broadcast)
        console.log('data: ', broadcast.txid)
        jsonresponse = formatJsonRpcResult(id, broadcast.txid)
      }
      console.log('RESP TO SIGN: jsonresponse: ', jsonresponse)
      await WalletConnectWeb3Wallet.respondSessionRequest({
        topic,
        response: jsonresponse,
      })

      removeRequest(currentRequest.id)
    } catch (e) {
      console.error('HD WALLET ERROR', e)
      toast({
        title: 'Error',
        description: `Transaction error ${e}`,
        isClosable: true,
      })
    } finally {
      setLoadingSigningInProgress(false)
    }
  }

  const onReject = useCallback(async () => {
    const response = rejectEIP155Request(currentRequest)
    WalletConnectWeb3Wallet.respondSessionRequest({
      topic: currentRequest.topic,
      response,
    })
    removeRequest(currentRequest.id)
    setLoadingSigningInProgress(false)
  }, [currentRequest, removeRequest])

  return (
    <FormProvider {...form}>
      <VStack p={6} spacing={6} alignItems='stretch'>
        <Box>
          <Text>
            (Cethod: {request.method}) CAIP: {caip}
          </Text>
        </Box>
        <Box>
          <Text
            fontWeight='medium'
            translation='plugins.walletConnectToDapps.modal.sendTransaction.sendingFrom'
            mb={4}
          />
          <AddressSummaryCard
            address={address ?? ''}
            name='My Wallet' // TODO: what string do we put here?
            icon={<KeepKeyIcon color='gray.500' w='full' h='full' />}
          />
        </Box>

        <Box>
          <Text
            fontWeight='medium'
            translation='plugins.walletConnectToDapps.modal.sendTransaction.interactingWith'
            mb={4}
          />
          <AddressSummaryCard
            address={request.params[0].to}
            icon={
              <Image
                borderRadius='full'
                w='full'
                h='full'
                src='https://assets.coincap.io/assets/icons/256/eth.png'
              />
            }
          />
        </Box>

        <Box>
          <Text
            fontWeight='medium'
            translation='plugins.walletConnectToDapps.modal.sendTransaction.contractInteraction.title'
            mb={4}
          />
          <Card bg={cardBg} borderRadius='md' px={4} py={2}>
            <ContractInteractionBreakdown request={request} />
          </Card>
        </Box>

        <ModalSection
          title={
            <HStack justify='space-between'>
              <Text translation='plugins.walletConnectToDapps.modal.sendTransaction.estGasCost' />
              {/*{legacyWeb3?.symbol && (*/}
              {/*  <GasFeeEstimateLabel symbol={legacyWeb3?.symbol} fiatRate={priceData} />*/}
              {/*)}*/}
            </HStack>
          }
          icon={<FaGasPump />}
          defaultOpen={false}
        >
          <Box pt={2}>
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
                  <Text
                    color='gray.500'
                    fontWeight='medium'
                    translation='gasInput.gasPrice.label'
                  />
                </HelperTooltip>
                {!!true && (
                  <RawText fontWeight='medium'>{`${currentRadioSelection} ${currentFeeAmount}`}</RawText>
                )}
              </HStack>

              <Box borderWidth={1} borderRadius='lg' borderColor={borderColor}>
                <RadioGroup
                  alignItems='stretch'
                  value={currentRadioSelection}
                  onChange={handleRadioChange}
                >
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
                            <Text
                              translation='gasInput.base.label'
                              color='gray.500'
                              fontWeight='medium'
                            />
                          </HelperTooltip>
                          <NumberInput
                            borderColor={borderColor}
                            mt={2}
                            onChange={gasFeeInputChange}
                          >
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
          </Box>
        </ModalSection>

        <ModalSection
          title={translate(
            'plugins.walletConnectToDapps.modal.sendTransaction.advancedParameters.title',
          )}
          icon={<FaWrench />}
          defaultOpen={false}
        >
          {/*<Card bg={useColorModeValue('white', 'gray.850')} p={4} borderRadius='md'>*/}
          {/*  <VStack alignItems='stretch'>*/}
          {/*    <Alert status='warning' variant='subtle' py={1} px={2} fontSize='sm'>*/}
          {/*      <AlertIcon />*/}
          {/*      <Text*/}
          {/*          color='orange.200'*/}
          {/*          translation='plugins.walletConnectToDapps.modal.sendTransaction.advancedParameters.alert'*/}
          {/*      />*/}
          {/*    </Alert>*/}

          {/*    <FormControl>*/}
          {/*      <FormLabel display='flex' columnGap={1}>*/}
          {/*        <Text*/}
          {/*            color='gray.500'*/}
          {/*            fontWeight='medium'*/}
          {/*            translation='plugins.walletConnectToDapps.modal.sendTransaction.advancedParameters.nonce.title'*/}
          {/*        />*/}
          {/*        <HelperTooltip*/}
          {/*            label={translate(*/}
          {/*                'plugins.walletConnectToDapps.modal.sendTransaction.advancedParameters.nonce.tooltip',*/}
          {/*            )}*/}
          {/*        />*/}
          {/*      </FormLabel>*/}
          {/*      <NumberInput borderColor={borderColor} mt={2}>*/}
          {/*        <NumberInputField*/}
          {/*            placeholder={translate(*/}
          {/*                'plugins.walletConnectToDapps.modal.sendTransaction.advancedParameters.nonce.placeholder',*/}
          {/*            )}*/}
          {/*            {recomendedNonce}*/}
          {/*        />*/}
          {/*      </NumberInput>*/}
          {/*    </FormControl>*/}

          {/*    <FormControl>*/}
          {/*      <FormLabel display='flex' columnGap={1}>*/}
          {/*        <Text*/}
          {/*            color='gray.500'*/}
          {/*            fontWeight='medium'*/}
          {/*            translation='plugins.walletConnectToDapps.modal.sendTransaction.advancedParameters.gasLimit.title'*/}
          {/*        />*/}
          {/*        <HelperTooltip*/}
          {/*            label={translate(*/}
          {/*                'plugins.walletConnectToDapps.modal.sendTransaction.advancedParameters.gasLimit.tooltip',*/}
          {/*            )}*/}
          {/*        />*/}
          {/*      </FormLabel>*/}
          {/*      <NumberInput borderColor={borderColor} mt={2}>*/}
          {/*        <NumberInputField*/}
          {/*            placeholder={translate(*/}
          {/*                'plugins.walletConnectToDapps.modal.sendTransaction.advancedParameters.gasLimit.placeholder',*/}
          {/*            )}*/}
          {/*            {recomendedGasLimit}*/}
          {/*        />*/}
          {/*      </NumberInput>*/}
          {/*    </FormControl>*/}
          {/*  </VStack>*/}
          {/*</Card>*/}
        </ModalSection>

        <Text
          fontWeight='medium'
          color='gray.500'
          translation='plugins.walletConnectToDapps.modal.sendTransaction.description'
        />

        <VStack spacing={4}>
          <Button
            size='lg'
            width='full'
            colorScheme='blue'
            type='submit'
            onClick={() => onConfirm()}
            isLoading={loadingSigningInProgress}
            disabled={loadingGas || loadingPriceData}
          >
            {translate('plugins.walletConnectToDapps.modal.signMessage.confirm')}
          </Button>
          <Button size='lg' width='full' onClick={onReject}>
            {translate('plugins.walletConnectToDapps.modal.signMessage.reject')}
          </Button>
        </VStack>
      </VStack>
    </FormProvider>
  )
}
