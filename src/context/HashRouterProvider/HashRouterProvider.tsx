import { createHashHistory, History, Location } from 'history'
import React, { useContext, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useQuery } from 'hooks/useQuery/useQuery'

type HashRouterContextProps<Q, P> = {
  location: Location
  history: History
  params: P
  query: Q
}

const HashRouterContext = React.createContext<HashRouterContextProps<any, any> | null>(null)

export function useHashRouter<Q, P>() {
  const ctx = useContext<HashRouterContextProps<Q, P> | null>(HashRouterContext)
  if (!ctx) throw new Error("useHashRouter can't be used outside of HashRouterContext")
  return ctx
}

type HashRouterProviderProps = {
  children: React.ReactNode
}

export function HashRouterProvider({ children }: HashRouterProviderProps) {
  const location = useLocation()
  const history = createHashHistory()
  const params = useParams()
  const query = useQuery()

  const router = useMemo(
    () => ({
      history,
      location,
      params,
      query
    }),
    [query, params, location, history]
  )

  return <HashRouterContext.Provider value={router}>{children}</HashRouterContext.Provider>
}
