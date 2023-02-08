import { WalletConnectedRoutes } from 'components/Layout/Header/NavBar/hooks/useMenuRoutes'
import type { WalletConnectedProps } from 'components/Layout/Header/NavBar/UserMenu'
import { SUPPORTED_WALLETS } from 'context/WalletProvider/config'
import { AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'

export const WalletConnectedMenu = ({ type }: WalletConnectedProps) => {
  const location = useLocation()
  const connectedWalletMenuRoutes = useMemo(
    () => type && SUPPORTED_WALLETS[type].connectedWalletMenuRoutes,
    [type],
  )

  return (
    <AnimatePresence exitBeforeEnter initial={false}>
      <Switch location={location} key={location.key}>
        <Route exact path={WalletConnectedRoutes.Connected}>
          <Redirect to={WalletConnectedRoutes.KeepKey} />
        </Route>
        {connectedWalletMenuRoutes?.map(route => {
          const Component = route.component
          return !Component ? null : (
            <Route
              key='walletConnectedMenuRoute'
              exact
              path={route.path}
              render={routeProps => <Component {...routeProps} />}
            />
          )
        })}
      </Switch>
    </AnimatePresence>
  )
}
