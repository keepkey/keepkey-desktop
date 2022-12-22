import axios, { AxiosError } from 'axios'

const instance = axios.create()

instance.interceptors.request.use(config => {
  if (!config.headers) return config
  config.headers['request-startTime'] = JSON.stringify(process.hrtime())
  return config
})

const responseInterceptor = (response: any) => {
  if (!response.config.headers) return response
  const start: any = JSON.parse(response.config.headers['request-startTime']?.toString() ?? '')
  const end = process.hrtime(start)
  const milliseconds = Math.round(end[0] * 1000 + end[1] / 1000000)
  response.headers['request-duration'] = milliseconds.toString()
  return response
}

const errorInterceptor = (err: any) => {
  if (!err.response) return err
  if (!err.response.config.headers) return err
  const start: any = JSON.parse(err.response.config.headers['request-startTime']?.toString() ?? '')
  const end = process.hrtime(start)
  const milliseconds = Math.round(end[0] * 1000 + end[1] / 1000000)
  err.response.headers['request-duration'] = milliseconds.toString()
  return err
}

instance.interceptors.response.use(responseInterceptor, errorInterceptor)

export type ServiceType = {
  _id: string
  name: string
  type: string
  tags: string[]
  blockchain: string
  symbol: string
  service: string
  chainId: number
  network: string[]
  facts: any[]
  infoURL: string
  shortName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  faucets: string[]
}

export type MergedServiceType = {
  _id: string
  name: string
  type: string
  tags: string[]
  blockchain: string
  symbol: string
  services: { url: string; latency: number | undefined }[]
  chainId: number
  network: string[]
  facts: any[]
  infoURL: string
  shortName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  faucets: string[]
}

export const mergeServices = (services: ServiceType[]): MergedServiceType[] => {
  const servicesMap: any = {}

  services.forEach(service => {
    const { chainId } = service
    if (servicesMap[chainId]) {
      servicesMap[chainId].services.push({
        url: service.service,
        latency: undefined,
      })
    } else {
      servicesMap[chainId] = {
        ...service,
        services: [
          {
            url: service.service,
            latency: undefined,
          },
        ],
      }
    }
  })

  return Object.values(servicesMap)
}

export const pingAndMergeServices = async (services: ServiceType[] | MergedServiceType[]) => {
  let mergedServices: MergedServiceType[] = services as MergedServiceType[]
  if (!mergedServices[0].services) mergedServices = mergeServices(services as ServiceType[])

  for (let serviceIdx = 0; serviceIdx < mergedServices.length; serviceIdx++) {
    const service = mergedServices[serviceIdx]
    for (let index = 0; index < service.services.length; index++) {
      const s = service.services[index]
      try {
        const resp = await instance.get(s.url).catch(e => {
          if (!e.response) {
            delete mergedServices[serviceIdx].services[index]
            mergedServices[serviceIdx].services.splice(index, 1)
            return
          }
          const latency = e.response.headers['request-duration']
          if (!latency) return
          mergedServices[serviceIdx].services[index].latency = Number(latency)
        })
        if (!resp) continue
        if (resp instanceof AxiosError) {
          if (!resp.response) continue
          const latency = resp.response.headers['request-duration']
          if (!latency) continue
          mergedServices[serviceIdx].services[index].latency = Number(latency)
        } else {
          const latency = resp.headers['request-duration']
          if (!latency) continue
          mergedServices[serviceIdx].services[index].latency = Number(latency)
        }
      } catch (error: any) {
        if (!error.response) {
          delete mergedServices[serviceIdx].services[index]
          mergedServices[serviceIdx].services.splice(index, 1)
          continue
        }
        const latency = error.response.headers['request-duration']
        if (!latency) continue
        mergedServices[serviceIdx].services[index].latency = Number(latency)
      }
    }
  }

  return mergedServices
}
