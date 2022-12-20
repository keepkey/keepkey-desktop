import type * as types from '../..'

// TODO: oneOf
export type Common = types.xrp.transaction.common.Base &
  (types.xrp.transaction.common.AccountTxnID | types.xrp.transaction.common.TicketSequence) &
  types.xrp.transaction.common.Signer

export namespace common {
  export type Base = {
    Account: types.xrp.Address
    /** @minLength 1 */
    TransactionType: string
    Fee: types.xrp.transaction.common.XrpFeeAmount
    Sequence: types.numeric.U32
    Flags?: types.numeric.U32
    LastLedgerSequence?: types.numeric.U32
    Memos?: /** @minProperties 1 */
    {
      MemoData: types.hex.bytes.Upper
      MemoFormat: types.xrp.hex.Memo
      MemoType: types.xrp.hex.Memo
    }[]
    SourceTag?: types.numeric.U32
  }

  export type Signer =
    | types.xrp.transaction.common.signer.Single
    | types.xrp.transaction.common.signer.Multi

  export namespace signer {
    /** @title single singer */
    export type Single = {
      SigningPubKey: types.xrp.hex.PubKey
    }

    /** @title multiple signers */
    export type Multi = {
      SigningPubKey: ''
      Singers: {
        Account: types.xrp.Address
        TxnSignature: types.xrp.Signature
        SigningPubKey: types.xrp.hex.PubKey
      }[]
    }
  }

  export type AccountTxnID = {
    AccountTxnId: types.xrp.Hash256
    TicketSequence?: null
  }
  export type TicketSequence = {
    AccountTxnId?: null
    TicketSequence: types.numeric.U32
  }

  /**
   * - whole number of drops
   * - unsigned decimal integer
   * - >= 10, <= 10^17
   * @title an amount of XRP, >= 10 drops
   * @minLength 2
   * @maxLength 18
   * @pattern ^(?:[1-9]\d{1,16}|100000000000000000)$
   */
  export type XrpFeeAmount = types.xrp.XrpAmount & unknown
}
