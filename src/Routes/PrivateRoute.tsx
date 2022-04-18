import { Redirect, Route, RouteProps } from 'react-router-dom'

type PrivateRouteProps = {
  hasWallet: boolean
  needsWallet?: boolean
} & RouteProps

export const PrivateRoute = ({ hasWallet, needsWallet = true, ...rest }: PrivateRouteProps) => {
  const { location } = rest

  return hasWallet || !needsWallet ? (
    <Route {...rest} />
  ) : (
    <Redirect
      to={{
        pathname: '/connect-wallet',
        search: `returnUrl=${location?.pathname ?? '/dashboard'}`,
      }}
    />
  )
}
