// @ts-expect-error
import Client from '@pioneer-platform/pioneer-client'
import { getConfig } from 'config'

export const getPioneerClient = async () => {
  let spec = getConfig().REACT_APP_DAPP_URL
  let config = {
    queryKey: 'key:public',
    username: 'user:public',
    spec,
  }
  let pioneer = new Client(spec, config)
  return await pioneer.init()
}
