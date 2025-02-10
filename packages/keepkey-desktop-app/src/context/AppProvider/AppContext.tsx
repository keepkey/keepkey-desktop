// @ts-nocheck
import { useToast } from '@chakra-ui/react'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import React, { createContext, useContext, useState } from 'react'
import { useDispatch } from 'react-redux'
import { preferences } from 'state/slices/preferencesSlice/preferencesSlice'

const moduleLogger = logger.child({ namespace: ['AppContext'] })

type AppContextValue = {
  toast: ReturnType<typeof useToast>
  currency: string
  setCurrency: (currency: string) => void
  isWalletLoaded: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const toast = useToast()
  const dispatch = useDispatch()
  const {
    state: { wallet },
  } = useWallet()
  const [currency, setCurrency] = useState('USD')
  const [isWalletLoaded, setIsWalletLoaded] = useState(false)

  const value = {
    toast,
    currency,
    setCurrency,
    isWalletLoaded
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
