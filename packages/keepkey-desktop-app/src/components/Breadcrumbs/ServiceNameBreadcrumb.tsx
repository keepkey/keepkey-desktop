import { ipcRenderer } from 'electron-shim'
import type { FC } from 'react'
import { useEffect, useState } from 'react'

export const ServiceNameBreadcrumb: FC<{ serviceKey: string }> = ({ serviceKey }) => {
  const [serviceName, setServiceName] = useState('')

  useEffect(() => {
    ipcRenderer.send('@bridge/service-name', serviceKey)
    ipcRenderer.once('@bridge/service-name', (_event: unknown, serviceName: string) => {
      setServiceName(serviceName)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <>{serviceName}</>
}
