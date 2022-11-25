import { useToast } from '@chakra-ui/react'
import type { Asset } from '@keepkey/asset-service'
import type { ChainId } from '@keepkey/caip'
import { CHAIN_NAMESPACE, ethAssetId, fromAssetId } from '@keepkey/caip'
import type { ChainAdapter, EvmChainId, UtxoBaseAdapter } from '@keepkey/chain-adapters'
import type {
  Swapper,
  Trade,
  TradeQuote,
  TradeResult,
  TradeTxs,
  UtxoSupportedChainIds,
} from '@keepkey/swapper'
import { SwapError, SwapErrorTypes, SwapperManager } from '@keepkey/swapper'
import type { BIP44Params, UtxoAccountType } from '@keepkey/types'
import { KnownChainIds } from '@keepkey/types'
import type { HDWallet } from '@keepkey/hdwallet-core'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { getSwapperManager } from 'components/Trade/hooks/useSwapper/swapperManager'
import {
  filterAssetsByIds,
  getReceiveAddress,
  getUtxoParams,
  isSupportedNonUtxoSwappingChain,
  isSupportedUtxoSwappingChain,
} from 'components/Trade/hooks/useSwapper/utils'
import type { TS } from 'components/Trade/types'
import { type BuildTradeInputCommonArgs } from 'components/Trade/types'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { useWallet } from 'hooks/useWallet/useWallet'
import { toBaseUnit } from 'lib/math'
import { selectAssetIds } from 'state/slices/assetsSlice/selectors'
import { selectFeatureFlags } from 'state/slices/preferencesSlice/selectors'
import {
  selectBIP44ParamsByAccountId,
  selectPortfolioAccountIdsByAssetId,
  selectPortfolioAccountMetadataByAccountId,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

/*
The Swapper hook is responsible for providing computed swapper state to consumers.
It does not mutate state.
*/
export const useSwapper = () => {
  // Form hooks
  const { control } = useFormContext<TS>()
  const sellTradeAsset = useWatch({ control, name: 'sellTradeAsset' })
  const buyTradeAsset = useWatch({ control, name: 'buyTradeAsset' })
  const quote = useWatch({ control, name: 'quote' })
  const sellAssetAccountId = useWatch({ control, name: 'sellAssetAccountId' })
  const buyAssetAccountId = useWatch({ control, name: 'buyAssetAccountId' })
  const isSendMax = useWatch({ control, name: 'isSendMax' })
  const isExactAllowance = useWatch({ control, name: 'isExactAllowance' })

  // Constants
  const sellAsset = sellTradeAsset?.asset
  const buyAsset = buyTradeAsset?.asset
  const buyAssetId = buyAsset?.assetId
  const sellAssetId = sellAsset?.assetId

  // Hooks
  const [swapperManager, setSwapperManager] = useState<SwapperManager>(() => new SwapperManager())
  const [bestTradeSwapper, setBestTradeSwapper] = useState<Swapper<KnownChainIds>>()
  const {
    state: { wallet },
  } = useWallet()
  const [receiveAddress, setReceiveAddress] = useState<string | null>()

  // Selectors
  const flags = useSelector(selectFeatureFlags)
  const assetIds = useSelector(selectAssetIds)

  // Callbacks
  const getSupportedSellableAssets = useCallback(
    (assets: Asset[]) => {
      const sellableAssetIds = swapperManager.getSupportedSellableAssetIds({
        assetIds,
      })
      return filterAssetsByIds(assets, sellableAssetIds)
    },
    [assetIds, swapperManager],
  )

  const sellAssetAccountIds = useAppSelector(state =>
    selectPortfolioAccountIdsByAssetId(state, { assetId: sellAsset?.assetId ?? '' }),
  )
  const sellAccountFilter = useMemo(
    () => ({ accountId: sellAssetAccountId ?? sellAssetAccountIds[0] }),
    [sellAssetAccountId, sellAssetAccountIds],
  )
  const sellAccountBip44Params = useAppSelector(state =>
    selectBIP44ParamsByAccountId(state, sellAccountFilter),
  )

  const buyAssetAccountIds = useAppSelector(state =>
    selectPortfolioAccountIdsByAssetId(state, { assetId: buyAsset?.assetId ?? '' }),
  )
  const buyAccountFilter = useMemo(
    () => ({ accountId: buyAssetAccountId ?? buyAssetAccountIds[0] }),
    [buyAssetAccountId, buyAssetAccountIds],
  )
  const buyAccountMetadata = useAppSelector(state =>
    selectPortfolioAccountMetadataByAccountId(state, buyAccountFilter),
  )

  const swapperSupportsCrossAccountTrade = useMemo(() => {
    if (!bestTradeSwapper) return false
    switch (bestTradeSwapper.name) {
      case SwapperName.Thorchain:
      case SwapperName.Osmosis:
        return true
      case SwapperName.Zrx:
      case SwapperName.CowSwap:
        return false
      default:
        return false
    }
  }, [bestTradeSwapper])

  const getReceiveAddressFromBuyAsset = useCallback(
    (buyAsset: Asset) => {
      if (!buyAccountMetadata) return
      const { accountType, bip44Params } = buyAccountMetadata
      return getReceiveAddress({ asset: buyAsset, wallet, bip44Params, accountType })
    },
    [buyAccountMetadata, wallet],
  )

  const getSupportedBuyAssetsFromSellAsset = useCallback(
    (assets: Asset[]): Asset[] | undefined => {
      const sellAssetId = sellTradeAsset?.asset?.assetId
      const assetIds = assets.map(asset => asset.assetId)
      const supportedBuyAssetIds = sellAssetId
        ? swapperManager.getSupportedBuyAssetIdsFromSellId({
            assetIds,
            sellAssetId,
          })
        : undefined
      return supportedBuyAssetIds ? filterAssetsByIds(assets, supportedBuyAssetIds) : undefined
    },
    [swapperManager, sellTradeAsset],
  )

  const checkApprovalNeeded = useCallback(async (): Promise<boolean> => {
    if (!bestTradeSwapper) throw new Error('No swapper available')
    if (!wallet) throw new Error('No wallet available')
    if (!quote) throw new Error('No quote available')
    const { approvalNeeded } = await bestTradeSwapper.approvalNeeded({ quote, wallet })
    return approvalNeeded
  }, [bestTradeSwapper, quote, wallet])

  const approve = useCallback(async (): Promise<string> => {
    if (!bestTradeSwapper) throw new Error('No swapper available')
    if (!wallet) throw new Error('no wallet available')
    if (!quote) throw new Error('no quote available')
    const txid = isExactAllowance
      ? await bestTradeSwapper.approveAmount({
          amount: quote.sellAmountCryptoPrecision,
          quote,
          wallet,
        })
      : await bestTradeSwapper.approveInfinite({ quote, wallet })
    return txid
  }, [bestTradeSwapper, isExactAllowance, quote, wallet])

    const trade: Trade<KnownChainIds> = await (async () => {
      const { chainNamespace } = fromAssetId(sellAsset.assetId)
      if (isSupportedSwappingChain(sellAsset.chainId) && sellAccountMetadata) {
        return swapper.buildTrade({
          chainId: sellAsset.chainId,
          sellAmount: amount,
          sellAsset,
          buyAsset,
          bip44Params: sellAccountMetadata.bip44Params,
          accountType: sellAccountMetadata.accountType,
          wallet,
          sendMax: false,
          receiveAddress,
        })
      } else if (chainNamespace === CHAIN_NAMESPACE.Utxo && sellAccountMetadata.accountType) {
        const sellAssetChainAdapter = getChainAdapterManager().get(
          sellAsset.chainId,
        ) as unknown as UtxoBaseAdapter<UtxoSupportedChainIds>
        const { xpub } = await sellAssetChainAdapter.getPublicKey(
          wallet,
          sellAccountMetadata.bip44Params,
          sellAccountMetadata.accountType,
        )
        return swapper.buildTrade({
          chainId: sellAsset.chainId as UtxoSupportedChainIds,
          sellAmount: amount,
          sellAsset,
          buyAsset,
          wallet,
          sendMax: false,
          receiveAddress,
          bip44Params: sellAccountMetadata.bip44Params,
          accountType: sellAccountMetadata.accountType,
          xpub,
        })
      }
      throw new Error(`unsupported chain id ${sellAsset.chainId}`)
    })()

    await setFormFees({ trade, sellAsset, tradeFeeSource: swapper.name })
    setValue('trade', trade)
  }

  const getTradeTxs = async (tradeResult: TradeResult): Promise<TradeTxs> => {
    const swapper = (await swapperManager.getBestSwapper({
      buyAssetId: trade.buyAsset.assetId,
      sellAssetId: trade.sellAsset.assetId,
    })) as Swapper<ChainId>
    if (!swapper) throw new Error('no swapper available')

    return swapper.getTradeTxs(tradeResult)
  }

  const executeQuote = async (): Promise<TradeResult> => {
    // TODO(0xdef1cafe): this should be pure be passed a quote to execute - the best swapper could change underneath us...
    const swapper = await swapperManager.getBestSwapper({
      buyAssetId: trade.buyAsset.assetId,
      sellAssetId: trade.sellAsset.assetId,
    })
    if (!swapper) throw new Error('no swapper available')
    if (!wallet) throw new Error('no wallet available')

    return swapper.executeTrade({ trade, wallet })
  }

  type GetFirstReceiveAddressArgs = {
    accountSpecifiersList: ReturnType<typeof selectAccountSpecifiers>
    buyAsset: Asset
    chainAdapter: ChainAdapter<ChainId>
    wallet: HDWallet
    bip44Params: BIP44Params
    accountType: UtxoAccountType | undefined
  }
  type GetFirstReceiveAddress = (args: GetFirstReceiveAddressArgs) => Promise<string>
  const getFirstReceiveAddress: GetFirstReceiveAddress = async ({
    accountSpecifiersList,
    buyAsset,
    chainAdapter,
    wallet,
    bip44Params,
    accountType,
  }) => {
    // Get first specifier for receive asset chain id
    // Eventually we may want to customize which account they want to receive trades into
    const receiveAddressAccountSpecifiers = accountSpecifiersList.find(
      specifiers => specifiers[buyAsset.chainId],
    )

    if (!receiveAddressAccountSpecifiers) throw new Error('no receiveAddressAccountSpecifiers')
    const account = receiveAddressAccountSpecifiers[buyAsset.chainId]
    if (!account) throw new Error(`no account for ${buyAsset.chainId}`)

    const receiveAddress = await chainAdapter.getAddress({ wallet, accountType, bip44Params })
    return receiveAddress
  }

  const updateQuoteDebounced = useRef(
    debounce(
      async ({
        amount,
        swapper,
        sellAsset,
        buyAsset,
        action,
        wallet,
        accountSpecifiersList,
        selectedCurrencyToUsdRate,
        sellAssetFiatRate,
        buyAssetFiatRate,
      }: DebouncedQuoteInput) => {
        try {
          const { sellAmountSellAssetBaseUnit, buyAmountBuyAssetBaseUnit, fiatSellAmount } =
            calculateAmounts({
              amount,
              buyAsset,
              sellAsset,
              buyAssetUsdRate: buyAssetFiatRate,
              sellAssetUsdRate: sellAssetFiatRate,
              action,
              selectedCurrencyToUsdRate,
              sellAssetTradeFeeUsd: bn(0), // A temporary shim so we don't propagate new tradeFee logic to V1 Swapper
              buyAssetTradeFeeUsd: bn(0), // A temporary shim so we don't propagate new tradeFee logic to V1 Swapper
            })

          const { chainId: receiveAddressChainId } = fromAssetId(buyAsset.assetId)
          const chainAdapter = getChainAdapterManager().get(receiveAddressChainId)

          if (!chainAdapter)
            throw new Error(`couldn't get chain adapter for ${receiveAddressChainId}`)

          const state = store.getState()
          const buyAssetAccountIds = selectPortfolioAccountIdsByAssetId(state, {
            assetId: buyAsset?.assetId ?? '',
          })
          const sellAssetAccountIds = selectPortfolioAccountIdsByAssetId(state, {
            assetId: sellAsset?.assetId ?? '',
          })
          const sellAccountFilter = { accountId: sellAssetAccountIds[0] ?? '' }
          const buyAccountFilter = { accountId: buyAssetAccountIds[0] ?? '' }

          const buyAccountMetadata = selectPortfolioAccountMetadataByAccountId(
            state,
            buyAccountFilter,
          )
          const sellAccountMetadata = selectPortfolioAccountMetadataByAccountId(
            state,
            sellAccountFilter,
          )

          const receiveAddress = await getFirstReceiveAddress({
            accountSpecifiersList,
            buyAsset,
            chainAdapter,
            wallet,
            bip44Params: buyAccountMetadata.bip44Params,
            accountType: buyAccountMetadata.accountType,
          })

          const tradeQuote: TradeQuote<KnownChainIds> = await (async () => {
            const { chainNamespace } = fromAssetId(sellAsset.assetId)
            if (isSupportedSwappingChain(sellAsset.chainId)) {
              return swapper.getTradeQuote({
                chainId: sellAsset.chainId,
                sellAsset,
                buyAsset,
                sellAmount: sellAmountSellAssetBaseUnit,
                sendMax: false,
                bip44Params: sellAccountMetadata.bip44Params,
                receiveAddress,
              })
            } else if (chainNamespace === CHAIN_NAMESPACE.Utxo) {
              if (!sellAccountMetadata.accountType) throw new Error('no accountType')
              const sellAssetChainAdapter = getChainAdapterManager().get(
                sellAsset.chainId,
              ) as unknown as UtxoBaseAdapter<UtxoSupportedChainIds>
              const { xpub } = await sellAssetChainAdapter.getPublicKey(
                wallet,
                sellAccountMetadata.bip44Params,
                sellAccountMetadata.accountType,
              )
              return swapper.getTradeQuote({
                chainId: sellAsset.chainId as UtxoSupportedChainIds,
                sellAsset,
                buyAsset,
                sellAmount: sellAmountSellAssetBaseUnit,
                sendMax: false,
                bip44Params: sellAccountMetadata.bip44Params,
                accountType: sellAccountMetadata.accountType,
                receiveAddress,
                xpub,
              })
            }
            throw new Error(`unsupported chain id ${sellAsset.chainId}`)
          })()

          await setFormFees({ trade: tradeQuote, sellAsset, tradeFeeSource: swapper.name })

          const minSellAmount = toBaseUnit(tradeQuote.minimum, tradeQuote.sellAsset.precision)
          const isBelowMinSellAmount = bnOrZero(tradeQuote.sellAmount).lt(minSellAmount)

          if (isBelowMinSellAmount) {
            setValue('quoteError', SwapErrorTypes.TRADE_QUOTE_AMOUNT_TOO_SMALL)
          }
          setValue('quote', tradeQuote)

          // Update trade input form fields to new calculated amount
          setValue('fiatSellAmount', fiatSellAmount) // Fiat input field amount
          setValue(
            'buyTradeAsset.amount',
            fromBaseUnit(buyAmountBuyAssetBaseUnit, buyAsset.precision),
          ) // Buy asset input field amount
          setValue(
            'sellTradeAsset.amount',
            fromBaseUnit(sellAmountSellAssetBaseUnit, sellAsset.precision),
          ) // Sell asset input field amount
        } catch (e) {
          if (
            e instanceof SwapError &&
            e.code &&
            [
              SwapErrorTypes.TRADE_QUOTE_AMOUNT_TOO_SMALL,
              SwapErrorTypes.TRADE_QUOTE_INPUT_LOWER_THAN_FEES,
            ].includes(e.code as SwapErrorTypes)
          ) {
            // TODO: Abstract me away, current error handling is a mess
            // We will need a full swapper error refactoring, to have a single source of truth for errors handling, and to be able to either:
            //   - set a form error field to be consumed as form button states
            //   - pop an error toast
            // depending on the error type
            return setValue('quoteError', SwapErrorTypes[e.code as SwapErrorTypes])
          }
          showErrorToast(e)
        }
      },
      debounceTime,
    ),
  )

  const updateQuote = useCallback(
    async ({
      amount,
      sellAsset,
      buyAsset,
      action,
      forceQuote,
      selectedCurrencyToUsdRate,
    }: GetQuoteInput) => {
      setValue('quoteError', null)
      if (!wallet || !accountSpecifiersList.length) return
      if (!sellAssetAccountId) return
      if (!sellAssetFiatRate || !buyAssetFiatRate || !feeAssetFiatRate) return
      if (!forceQuote && bnOrZero(amount).isZero()) return
      if (!Array.from(swapperManager.swappers.keys()).length) return
      setValue('quote', undefined)
      clearErrors('quote')

      const swapper = await swapperManager.getBestSwapper({
        buyAssetId: buyAsset.assetId,
        sellAssetId: sellAsset.assetId,
      })

      // we assume that if we do not have a swapper returned, it is not a valid trade pair
      if (!swapper) {
        setError('quote', { message: 'trade.errors.invalidTradePairBtnText' })
        return toast({
          title: translate('trade.errors.title'),
          description: translate('trade.errors.invalidTradePair', {
            sellAssetName: sellAsset.name,
            buyAssetName: buyAsset.name,
          }),
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top-right',
        })
      } else {
        await updateQuoteDebounced.current({
          swapper,
          amount,
          sellAsset,
          action,
          buyAsset,
          wallet,
          accountSpecifiersList,
          selectedCurrencyToUsdRate,
          sellAssetAccountId,
          sellAssetFiatRate,
          buyAssetFiatRate,
          feeAssetFiatRate,
        })
      }
    },
    [
      setValue,
      wallet,
      accountSpecifiersList,
      sellAssetAccountId,
      sellAssetFiatRate,
      buyAssetFiatRate,
      feeAssetFiatRate,
      swapperManager,
      clearErrors,
      setError,
      toast,
      translate,
    ],
  )

  const setFormFees = async ({
    trade,
    sellAsset,
    tradeFeeSource,
  }: {
    trade: Trade<KnownChainIds> | TradeQuote<KnownChainIds>
    sellAsset: Asset
    tradeFeeSource: string
  }) => {
    const networkFeeCryptoHuman = fromBaseUnit(trade?.feeData?.networkFee, feeAsset.precision)

    const getEvmFees = (): DisplayFeeData<EvmChainId> => {
      const evmTrade = trade as Trade<EvmChainId>
      const approvalFee = bnOrZero(evmTrade.feeData.chainSpecific.approvalFee)
        .dividedBy(bn(10).exponentiatedBy(feeAsset.precision))
        .toString()
      const totalFee = bnOrZero(networkFeeCryptoHuman).plus(approvalFee).toString()
      const gasPrice = bnOrZero(evmTrade.feeData.chainSpecific.gasPrice).toString()
      const estimatedGas = bnOrZero(evmTrade.feeData.chainSpecific.estimatedGas).toString()

      return {
        fee: networkFeeCryptoHuman,
        chainSpecific: {
          approvalFee,
          gasPrice,
          estimatedGas,
          totalFee,
        },
        tradeFee: evmTrade.feeData.sellAssetTradeFeeUsd ?? '',
        tradeFeeSource,
        networkFeeCryptoHuman,
        sellAssetTradeFeeUsd: evmTrade.feeData.sellAssetTradeFeeUsd ?? '',
        buyAssetTradeFeeUsd: evmTrade.feeData.buyAssetTradeFeeUsd ?? '',
      }
    }

    const { chainNamespace } = fromAssetId(sellAsset.assetId)

    switch (chainNamespace) {
      case CHAIN_NAMESPACE.Evm:
        const fees = getEvmFees()
        setValue('fees', fees)
        break
      case CHAIN_NAMESPACE.CosmosSdk: {
        const fees: DisplayFeeData<KnownChainIds.OsmosisMainnet | KnownChainIds.CosmosMainnet> = {
          fee: networkFeeCryptoHuman,
          networkFeeCryptoHuman,
          tradeFee: trade.feeData.sellAssetTradeFeeUsd ?? '',
          buyAssetTradeFeeUsd: trade.feeData.buyAssetTradeFeeUsd ?? '',
          tradeFeeSource,
          sellAssetTradeFeeUsd: trade.feeData.sellAssetTradeFeeUsd ?? '',
        }
        setValue('fees', fees)
        break
      }
      case CHAIN_NAMESPACE.Utxo:
        {
          const utxoTrade = trade as Trade<UtxoSupportedChainIds>

          const fees: DisplayFeeData<UtxoSupportedChainIds> = {
            fee: networkFeeCryptoHuman,
            networkFeeCryptoHuman,
            chainSpecific: utxoTrade.feeData.chainSpecific,
            tradeFee: utxoTrade.feeData.sellAssetTradeFeeUsd ?? '',
            buyAssetTradeFeeUsd: utxoTrade.feeData.buyAssetTradeFeeUsd ?? '',
            tradeFeeSource,
            sellAssetTradeFeeUsd: utxoTrade.feeData.sellAssetTradeFeeUsd ?? '',
          }
          setValue('fees', fees)
        }
        break
      default:
        throw new Error('Unsupported chain ' + sellAsset.chainId)
    }
  }

  const checkApprovalNeeded = async (): Promise<boolean> => {
    const swapper = await swapperManager.getBestSwapper({
      buyAssetId: quote.buyAsset.assetId,
      sellAssetId: quote.sellAsset.assetId,
    })
    if (!swapper) throw new Error('no swapper available')
    if (!wallet) throw new Error('no wallet available')
    const { approvalNeeded } = await swapper.approvalNeeded({ quote, wallet })
    return approvalNeeded
  }

  const approve = async (): Promise<string> => {
    const swapper = await swapperManager.getBestSwapper({
      buyAssetId: quote.buyAsset.assetId,
      sellAssetId: quote.sellAsset.assetId,
    })

    if (!swapper) throw new Error('no swapper available')
    if (!wallet) throw new Error('no wallet available')
    const txid = isExactAllowance
      ? await swapper.approveAmount({ amount: quote.sellAmount, quote, wallet })
      : await swapper.approveInfinite({ quote, wallet })
    return txid
  }

  useEffect(() => {
    ;(async () => {
      flags && setSwapperManager(await getSwapperManager(flags))
    })()
  }, [flags])

  // Set the receiveAddress when the buy asset changes
  useEffect(() => {
    const buyAsset = buyTradeAsset?.asset
    if (!buyAsset) return
    ;(async () => {
      try {
        const receiveAddress = await getReceiveAddressFromBuyAsset(buyAsset)
        setReceiveAddress(receiveAddress)
      } catch (e) {
        setReceiveAddress(null)
      }
    })()
  }, [buyTradeAsset?.asset, getReceiveAddressFromBuyAsset])

  return {
    getSupportedSellableAssets,
    getSupportedBuyAssetsFromSellAsset,
    swapperManager,
    checkApprovalNeeded,
    bestTradeSwapper,
    receiveAddress,
    getReceiveAddressFromBuyAsset,
    getTrade,
    swapperSupportsCrossAccountTrade,
    approve,
  }
}
