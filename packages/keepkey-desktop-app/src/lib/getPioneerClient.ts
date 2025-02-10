// @ts-expect-error
import Client from '@pioneer-platform/pioneer-client'
import { getConfig } from 'config'

export const getPioneerClient = async (config: any = {}) => {
  try {
    if (!config || typeof config !== 'object') {
      config = {}
    }
    
    const client = new Client(getConfig().REACT_APP_DAPP_URL, config)
    if (!client) {
      throw new Error('Failed to initialize Pioneer client')
    }
    
    return await client.init()
  } catch (error) {
    console.error('Failed to get Pioneer client:', error)
    return null
  }
}
