import { Layout } from 'components/Layout/Layout'
import { LanguageTypeEnum } from 'constants/LanguageTypeEnum'
import { useBrowserRouter } from 'hooks/useBrowserRouter/useBrowserRouter'
import { useQuery } from 'hooks/useQuery/useQuery'
import { useWallet } from 'hooks/useWallet/useWallet'
import { Authenticator } from 'pages/Authenticator/Authenticator'
import { ConnectWallet } from 'pages/ConnectWallet/ConnectWallet'
import { Flags } from 'pages/Flags/Flags'
import { NotFound } from 'pages/NotFound/NotFound'
import { Pairings } from 'pages/Pairings/Pairings'
import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import { preferences } from 'state/slices/preferencesSlice/preferencesSlice'
import { selectSelectedLocale } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { PrivateRoute } from './PrivateRoute'

function useLocationBackground() {
  const location = useLocation<{ background: any }>()
  const background = location.state && location.state.background
  return { background, location }
}

export const Routes = () => {
  const dispatch = useDispatch()
  const { background, location } = useLocationBackground()
  const { state } = useWallet()
  const { appRoutes } = useBrowserRouter()
  const hasWallet = Boolean(state.walletInfo?.deviceId)
  // @ts-ignore
  const { lang } = useQuery()
  const selectedLocale = useAppSelector(selectSelectedLocale)

  useEffect(() => {
    if (lang && LanguageTypeEnum[lang as LanguageTypeEnum] && selectedLocale !== lang) {
      dispatch(preferences.actions.setSelectedLocale({ locale: lang }))
    }
  }, [lang, dispatch, selectedLocale])

  /**
   * Memoize the route list to avoid unnecessary cascading re-renders
   * It should only re-render if the wallet changes
   */
  const privateRoutesList = useMemo(
    () =>
      appRoutes.map(route => {
        const MainComponent = route.main
        return (
          <PrivateRoute key={'privateRoute'} path={route.path} exact hasWallet={hasWallet}>
            <Layout>{MainComponent && <MainComponent />}</Layout>
          </PrivateRoute>
        )
      }),
    [appRoutes, hasWallet],
  )

  return (
    <Switch location={background || location}>
      {privateRoutesList}
      <Route path='/connect-wallet'>
        <ConnectWallet />
      </Route>
      <Route path='/flags'>
        <Layout>
          <Flags />
        </Layout>
      </Route>
      <Route path='/pairings'>
        <Layout>
          <Pairings />
        </Layout>
      </Route>
      <Route path='/authenticator'>
        <Layout>
          <Authenticator />
        </Layout>
      </Route>
      <Redirect from='/' to='/browser' />
      <Route component={NotFound} />
    </Switch>
  )
}
