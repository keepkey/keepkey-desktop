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

export const mergeServices = (services: ServiceType[]) => {
  const newServices = services.reduce((acc: any, curr) => {
    const existingService = acc.find((service: any) => service.chainId === curr.chainId)
    if (existingService) {
      existingService.service.push(curr.service)
    } else {
      acc.push({ ...curr, service: [curr.service] })
    }
    return acc
  }, [])

  return newServices
}
