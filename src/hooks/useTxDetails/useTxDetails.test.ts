import type { Asset } from '@keepkey/asset-service'
import type { TxTransfer } from '@keepkey/chain-adapters'
import { TransferType } from '@keepkey/unchained-client'
import { BtcSend, createMockEthTxs, EthReceive, EthSend, TradeTx } from 'test/mocks/txs'
import {
  getBuyTransfer,
  getSellTransfer,
  getStandardTx,
  getTransferByAsset,
  getTransferByType,
  isSupportedContract,
  isTradeContract,
} from 'hooks/useTxDetails/useTxDetails'
import type { Tx } from 'state/slices/txHistorySlice/txHistorySlice'

describe('getStandardTx', () => {
  it('returns the expected values', () => {
    expect(getStandardTx(EthSend)).toEqual(EthSend.transfers[0]) // When 1 transfer (an ETH tx)
    expect(getStandardTx(BtcSend)).toBeUndefined() // When !== 1 transfer (a BTC tx)
  })
})

describe('getBuyTransfer', () => {
  it('returns the expected values', () => {
    expect(getBuyTransfer(EthSend)).toBeUndefined()
    expect(getBuyTransfer(EthReceive)).toEqual(EthReceive.transfers[0])
    expect(getBuyTransfer(TradeTx)).toEqual(TradeTx.transfers[0])
  })
})

describe('getSellTransfer', () => {
  it('returns the expected values', () => {
    expect(getSellTransfer(EthSend)).toEqual(EthSend.transfers[0])
    expect(getSellTransfer(EthReceive)).toBeUndefined()
    expect(getSellTransfer(TradeTx)).toEqual(TradeTx.transfers[1])
  })
})

describe('isTradeContract', () => {
  it('returns true for trade', () => {
    const account = '0xfoxy'
    const buy = {
      from: '0xpoolA',
      to: account,
    } as TxTransfer
    const sell = {
      from: account,
      to: '0xpoolB',
    } as TxTransfer
    expect(isTradeContract(buy, sell)).toEqual(true)
  })

const [deposit, , withdrawUsdc] = createMockEthTxs('foo')

const marketData = {} as Record<AssetId, MarketData | undefined>

describe('useTxDetails', () => {
  it('should get correct type for standard send', () => {
    const transfers = getTransfers(EthSend.transfers, mockAssetState().byId, marketData)
    const type = getTxType(EthSend, transfers)
    expect(type).toEqual(TransferType.Send)
  })

  it('should get correct type for a standard receive', () => {
    const transfers = getTransfers(EthReceive.transfers, mockAssetState().byId, marketData)
    const type = getTxType(EthReceive, transfers)
    expect(type).toEqual(TransferType.Receive)
  })

  it('should get correct type for a trade', () => {
    const transfers = getTransfers(TradeTx.transfers, mockAssetState().byId, marketData)
    const type = getTxType(TradeTx, transfers)
    expect(type).toEqual(TradeType.Trade)
  })

  it('should get correct type for a supported method', () => {
    const transfers = getTransfers(deposit.transfers, mockAssetState().byId, marketData)
    const type = getTxType(deposit, transfers)
    expect(type).toEqual('method')
  })

  it('should get correct type for an unknown tx', () => {
    const unknown = deposit
    unknown.data!.method = 'unknown'
    const transfers = getTransfers(unknown.transfers, mockAssetState().byId, marketData)
    const type = getTxType(unknown, transfers)
    expect(type).toEqual('unknown')
  })

  it('should filter transfers by active asset', () => {
    const transfers = getTransfers(withdrawUsdc.transfers, mockAssetState().byId, marketData, usdc)
    expect(transfers.length).toEqual(1)
    expect(transfers[0].asset).toEqual(usdc)
  })
})
