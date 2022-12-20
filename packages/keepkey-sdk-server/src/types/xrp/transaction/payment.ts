import type * as types from '../..'

export type Payment = types.xrp.transaction.Common & {
  TransactionType: 'Payment'
  Amount: types.xrp.CurrencyAmount
  Destination: types.xrp.Address
  DestinationTag?: types.numeric.U32
  InvoiceID?: types.xrp.Hash256
  Paths?: types.xrp.PathSet
  SendMax?: types.xrp.CurrencyAmount
  DeliverMin?: types.xrp.CurrencyAmount
}
