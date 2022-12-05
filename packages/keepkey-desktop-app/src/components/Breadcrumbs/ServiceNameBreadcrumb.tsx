import { ipcListeners } from 'electron-shim'
import type { FC } from 'react'
import { useEffect, useState } from 'react'

export const ServiceNameBreadcrumb: FC<{ serviceKey: string }> = ({ serviceKey }) => {
  const [serviceName, setServiceName] = useState('')

  useEffect(() => {
    ipcListeners.bridgeServiceName(serviceKey).then(x => x && setServiceName(x))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <>{serviceName}</>
}
