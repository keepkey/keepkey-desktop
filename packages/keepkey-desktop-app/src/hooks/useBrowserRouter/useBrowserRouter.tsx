import type { BrowserRouterContextProps } from 'context/BrowserRouterProvider/BrowserRouterContext'
import { BrowserRouterContext } from 'context/BrowserRouterProvider/BrowserRouterContext'
import { useContext } from 'react'

export function useBrowserRouter<Q, P>() {
  const ctx = useContext<BrowserRouterContextProps<Q, P> | null>(BrowserRouterContext)
  if (!ctx) throw new Error("useBrowserRouter can't be used outside of BrowserRouterContext")
  return ctx
}
