import { btcAssetId, ethAssetId, foxAssetId } from '@shapeshiftoss/caip'
import { BtcSend, EthReceive, EthSend, FOXSend } from 'test/mocks/txs'

import { addToIndex, getRelatedAssetIds } from './utils'

describe('txHistorySlice:utils', () => {
  describe('getRelatedAssetIds', () => {
    it('can get related asset ids from eth send', () => {
      const relatedAssetIds = getRelatedAssetIds(EthSend)
      expect(relatedAssetIds.length).toEqual(1)
      expect(relatedAssetIds.includes(ethAssetId)).toBeTruthy()
    })

    it('can get related asset ids from btc send', () => {
      const relatedAssetIds = getRelatedAssetIds(BtcSend)
      expect(relatedAssetIds.length).toEqual(1)
      expect(relatedAssetIds.includes(btcAssetId)).toBeTruthy()
    })

    it('can get related asset ids from eth receive', () => {
      const relatedAssetIds = getRelatedAssetIds(EthReceive)
      expect(relatedAssetIds.length).toEqual(1)
      expect(relatedAssetIds.includes(ethAssetId)).toBeTruthy()
    })

    it('can get related asset ids from fox send', () => {
      const relatedAssetIds = getRelatedAssetIds(FOXSend)
      expect(relatedAssetIds.length).toEqual(2)
      expect(relatedAssetIds.includes(foxAssetId)).toBeTruthy()
      expect(relatedAssetIds.includes(ethAssetId)).toBeTruthy()
    })
  })

  describe('addToIndex', () => {
    it('should add a new item to an empty index', () => {
      expect(addToIndex([1, 2], [], 2)).toStrictEqual([2])
    })

    it('should add a new item to an existing index', () => {
      expect(addToIndex([1, 2], [1], 2)).toStrictEqual([1, 2])
    })

    it('should not add a new item if it does not exist in the parent', () => {
      expect(addToIndex([1, 2], [1], 3)).toStrictEqual([1])
    })

    it('should maintain the sort order from the parent', () => {
      expect(addToIndex([2, 1, 3], [3], 1)).toStrictEqual([1, 3])
    })
  })
})
