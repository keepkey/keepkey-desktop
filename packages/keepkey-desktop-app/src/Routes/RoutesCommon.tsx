import { FaGlobe, FaPlug } from 'react-icons/fa'
import { Browser } from 'pages/Browser/Browser'
import { PairingDetails } from 'pages/Pairings/PairingDetails'
import { Pairings } from 'pages/Pairings/Pairings'

import type { Route as NestedRoute } from './helpers'
import { RouteCategory } from './helpers'

export const routes: NestedRoute[] = [
  {
    path: '/browser',
    label: 'navBar.browser',
    icon: <FaGlobe />,
    category: RouteCategory.Explore,
    main: Browser,
  },
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
]
