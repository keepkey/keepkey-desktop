import type { ReduxState } from 'state/reducer'
import { INITIAL_PRICE_HISTORY } from 'state/slices/marketDataSlice/marketDataSlice'
import { CurrencyFormats } from 'state/slices/preferencesSlice/preferencesSlice'

const mockApiFactory = <T extends unknown>(reducerPath: T) => ({
  queries: {},
  mutations: {},
  provided: {},
  subscriptions: {},
  config: {
    reducerPath,
    keepUnusedDataFor: 0,
    online: false,
    focused: false,
    middlewareRegistered: false,
    refetchOnFocus: false,
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
  },
})

export const mockStore: ReduxState = {
  assetApi: mockApiFactory('assetApi' as const),
  portfolioApi: mockApiFactory('portfolioApi' as const),
  marketApi: mockApiFactory('marketApi' as const),
  txHistoryApi: mockApiFactory('txHistoryApi' as const),
  portfolio: {
    accounts: {
      byId: {},
      ids: [],
    },
    assetBalances: {
      byId: {},
      ids: [],
    },
    accountBalances: {
      byId: {},
      ids: [],
    },
    accountSpecifiers: {
      accountMetadataById: {},
      byId: {},
      ids: [],
    },
  },
  accountSpecifiers: {
    accountSpecifiers: [],
  },
  preferences: {
    featureFlags: {
      Osmosis: false,
      Thorchain: false,
      MultiAccounts: false,
    },
    selectedLocale: 'en',
    balanceThreshold: '0',
    selectedCurrency: 'USD',
    currencyFormat: CurrencyFormats.DotDecimal,
    showWelcomeModal: false,
    // the following object is required by redux-persist
    _persist: {
      version: 0,
      rehydrated: false,
    },
  },
  assets: {
    byId: {},
    ids: [],
  },
  marketData: {
    crypto: {
      byId: {},
      ids: [],
      priceHistory: INITIAL_PRICE_HISTORY,
    },
    fiat: {
      byId: {},
      ids: [],
      priceHistory: INITIAL_PRICE_HISTORY,
    },
  },
  txHistory: {
    txs: {
      byId: {},
      byAssetId: {},
      byAccountId: {},
      ids: [],
      status: 'loading',
    },
  },
}
