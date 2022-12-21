import type { IWalletContext } from 'context/WalletProvider/WalletContext'
import { WalletContext } from 'context/WalletProvider/WalletContext'
import type React from 'react'
import { useContext } from 'react'

export const useWallet = (): IWalletContext =>
  useContext(WalletContext as React.Context<IWalletContext>)
