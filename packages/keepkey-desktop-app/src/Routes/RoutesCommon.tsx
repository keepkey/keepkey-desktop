import { WalletConnectToDapps } from 'plugins/walletConnectToDapps/WalletConnectToDapps'
import { FaFlag, FaGlobe, FaBuromobelexperte, FaPlug, FaLock } from 'react-icons/fa'
// import { IoSwapVertical } from 'react-icons/io5'
import { AccountsIcon } from 'components/Icons/Accounts'
import { AssetsIcon } from 'components/Icons/Assets'
import { DashboardIcon } from 'components/Icons/Dashboard'
import { TxHistoryIcon } from 'components/Icons/TxHistory'
import { Account } from 'pages/Accounts/Account'
import { Accounts } from 'pages/Accounts/Accounts'
import { AccountToken } from 'pages/Accounts/AccountToken/AccountToken'
import { AccountTokenTxHistory } from 'pages/Accounts/AccountToken/AccountTokenTxHistory'
import { AccountTxHistory } from 'pages/Accounts/AccountTxHistory'
import { Asset } from 'pages/Assets/Asset'
import { Assets } from 'pages/Assets/Assets'
import { AssetTxHistory } from 'pages/Assets/AssetTxHistory'
import { KeepkeyAsset } from 'pages/Assets/KeepkeyAsset'
import { Browser } from 'pages/Browser/Browser'
import { Dashboard } from 'pages/Dashboard/Dashboard'
// import { Overview } from 'pages/Defi/views/Overview'
import { Flags } from 'pages/Flags/Flags'
// import { Leaderboard } from 'pages/Leaderboard/Leaderboard'
import { PairingDetails } from 'pages/Pairings/PairingDetails'
import { Pairings } from 'pages/Pairings/Pairings'
// import { Trade } from 'pages/Trade/Trade'
import { TransactionHistory } from 'pages/TransactionHistory/TransactionHistory'

import type { Route as NestedRoute } from './helpers'
import { RouteCategory } from './helpers'
import { Authenticator } from 'pages/Authenticator/Authenticator'

export const routes: NestedRoute[] = [
  {
    path: '/dashboard',
    label: 'navBar.dashboard',
    icon: <DashboardIcon />,
    main: Dashboard,
    category: RouteCategory.Wallet,
  },
  {
    path: '/dapps',
    label: 'navBar.dApps',
    main: WalletConnectToDapps,
    icon: <FaBuromobelexperte />,
    category: RouteCategory.Wallet,
  },
  //@TODO move to flag
  // {
  //   path: '/leaderboard',
  //   label: 'Leaderboard',
  //   icon: <IoSwapVertical />,
  //   main: Leaderboard,
  //   category: RouteCategory.Wallet,
  // },
  {
    path: '/transaction-history',
    label: 'navBar.transactionHistory',
    icon: <TxHistoryIcon />,
    main: TransactionHistory,
    category: RouteCategory.Explore,
  },
  {
    path: '/browser',
    label: 'navBar.browser',
    icon: <FaGlobe />,
    category: RouteCategory.Explore,
    main: Browser,
  },
  // {
  //   path: '/trade',
  //   label: 'navBar.trade',
  //   icon: <IoSwapVertical />,
  //   main: Trade,
  //   category: RouteCategory.Explore,
  // },
  {
    path: '/pairings',
    label: 'navBar.pairings',
    icon: <FaPlug />,
    category: RouteCategory.Explore,
    main: Pairings,
    routes: [
      {
        path: '/:serviceKey',
        label: 'Pairing Detail',
        icon: <FaPlug />,
        main: PairingDetails,
        hide: true,
      },
    ],
  },
  {
    path: '/authenticator',
    label: 'navBar.authenticator',
    icon: <FaLock />,
    category: RouteCategory.Explore,
    main: Authenticator,
  },
  {
    path: '/assets',
    label: 'navBar.assets',
    main: Assets,
    icon: <AssetsIcon />,
    category: RouteCategory.Wallet,
    routes: [
      {
        path: '/:chainId/:assetSubId',
        label: 'Overview',
        icon: <AssetsIcon />,
        main: null,
        hide: true,
        routes: [
          {
            path: '/',
            label: 'navBar.overview',
            main: Asset,
          },
          {
            path: '/transactions',
            label: 'navBar.transactions',
            main: AssetTxHistory,
          },
        ],
      },
      {
        path: '/keepkey/:chainId/:assetSubId',
        label: 'Overview',
        icon: <AssetsIcon />,
        main: null,
        hide: true,
        routes: [
          {
            path: '/',
            label: 'navBar.overview',
            main: KeepkeyAsset,
          },
        ],
      },
    ],
  },
  {
    path: '/accounts',
    label: 'navBar.accounts',
    main: Accounts,
    icon: <AccountsIcon />,
    category: RouteCategory.Explore,
    routes: [
      {
        path: '/:accountId',
        label: 'Account Details',
        main: null,
        hide: true,
        routes: [
          {
            path: '/',
            label: 'navBar.overview',
            main: Account,
          },
          {
            path: '/transactions',
            label: 'navBar.transactions',
            main: AccountTxHistory,
          },
          {
            path: '/:assetId',
            label: 'navBar.overview',
            main: null,
            hide: true,
            routes: [
              {
                path: '/',
                main: AccountToken,
                label: 'navBar.overview',
              },
              {
                path: '/transactions',
                main: AccountTokenTxHistory,
                label: 'navBar.transactions',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/flags',
    label: 'navBar.featureFlags',
    icon: <FaFlag />,
    hide: true,
    category: RouteCategory.Explore,
    main: Flags,
  },
]
