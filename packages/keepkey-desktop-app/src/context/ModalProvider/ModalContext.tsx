import type { ModalStateType } from 'context/ModalProvider/ModalProvider'
import { createContext } from 'react'
// testability
export function createModalContext<M>(context?: M) {
  return createContext<M>((context ?? {}) as M)
}

// context
// If initial state is removed/set to null, the KeepKey wallet modals will break
export const ModalContext = createModalContext<ModalStateType>()
