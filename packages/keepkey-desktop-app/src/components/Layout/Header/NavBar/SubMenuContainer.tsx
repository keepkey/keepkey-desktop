import { SlideTransition } from 'components/SlideTransition'
import type { PropsWithChildren } from 'react'

export const SubMenuContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return <SlideTransition>{children}</SlideTransition>
}
