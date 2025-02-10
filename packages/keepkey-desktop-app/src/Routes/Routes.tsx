import { Layout } from 'components/Layout/Layout'
import { LanguageTypeEnum } from 'constants/LanguageTypeEnum'
import { useBrowserRouter } from 'hooks/useBrowserRouter/useBrowserRouter'
import { useQuery } from 'hooks/useQuery/useQuery'
import { useWallet } from 'hooks/useWallet/useWallet'
import { Authenticator } from 'pages/Authenticator/Authenticator'
import { NotFound } from 'pages/NotFound/NotFound'
import { Pairings } from 'pages/Pairings/Pairings'
import { useEffect, useMemo } from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import { useAppContext } from 'context/AppProvider/AppContext'

import { PrivateRoute } from './PrivateRoute'

function useLocationBackground() {
  const location = useLocation<{ background: any }>()
  return useMemo(() => ({
    background: location.state && location.state.background,
    location
  }), [location])
}

export const Routes = () => {
  const { background, location } = useLocationBackground()
  const { state } = useWallet()
  const { appRoutes } = useBrowserRouter()
  const hasWallet = Boolean(state.walletInfo?.deviceId)
  const { lang } = useQuery()
  const { selectedLocale, setSelectedLocale } = useAppContext()

  useEffect(() => {
    if (lang && LanguageTypeEnum[lang as LanguageTypeEnum] && selectedLocale !== lang) {
      setSelectedLocale(lang)
    }
  }, [lang, selectedLocale, setSelectedLocale])

  /**
   * Memoize the route list to avoid unnecessary cascading re-renders
   * It should only re-render if the wallet changes
   */
  const privateRoutesList = useMemo(
    () =>
      appRoutes.map(route => {
        const MainComponent = route.main
        return (
          <PrivateRoute key={route.path} path={route.path} exact hasWallet={hasWallet}>
            <Layout>{MainComponent && <MainComponent />}</Layout>
          </PrivateRoute>
        )
      }),
    [appRoutes, hasWallet],
  )

  return (
    <Switch location={background || location}>
      {privateRoutesList}
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
      <Route exact path="/">
        <Redirect to='/browser' />
      </Route>
      <Route component={NotFound} />
    </Switch>
  )
}
