import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text as ChakraText,
} from '@chakra-ui/react'
// import { SessionTypes } from '@walletconnect/types'
import { ipcRenderer } from 'electron-shim'
import { useCallback, useEffect, useState } from 'react'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import Client from '@pioneer-platform/pioneer-client'
import { getConfig } from 'config'
import { useForm, useWatch } from 'react-hook-form'
import { SearchIcon } from '@chakra-ui/icons'

// info:  {
//     _id: '6393a20355fd0ef62a97fb20',
//     name: 'Binance Smart Chain Mainnet',
//     type: 'EVM',
//     tags: [
//       'KeepKeySupport',
//       'WalletConnectSupport',
//       'DappSupport',
//       'Binance Smart Chain Mainnet',
//       'bnb',
//       'BSC'
//     ],
//     blockchain: 'binance smart chain mainnet',
//     symbol: 'BSC',
//     service: 'https://bsc-dataseed2.binance.org',
//     chainId: 56,
//     network: [
//       'https://bsc-dataseed1.binance.org',
//       'https://bsc-dataseed2.binance.org',
//       'https://bsc-dataseed3.binance.org',
//       'https://bsc-dataseed4.binance.org',
//       'https://bsc-dataseed1.defibit.io',
//       'https://bsc-dataseed2.defibit.io',
//       'https://bsc-dataseed3.defibit.io',
//       'https://bsc-dataseed4.defibit.io',
//       'https://bsc-dataseed1.ninicoin.io',
//       'https://bsc-dataseed2.ninicoin.io',
//       'https://bsc-dataseed3.ninicoin.io',
//       'https://bsc-dataseed4.ninicoin.io',
//       'wss://bsc-ws-node.nariox.org'
//     ],
//     facts: [
//       {
//         signer: '0x3f2329c9adfbccd9a84f52c906e936a42da18cb8',
//         payload: '{"blockchain":"Binance Smart Chain Mainnet","chainId":56}',
//         signature: '0x8e5bae56924978e0256ee46ae01c213a369234b7698328ffb78fef397f198624313ae65b12a4604dcc93bd7d3b343a407fbc051d9ade503faa0e091997e710b81c'
//       }
//     ],
//     infoURL: 'https://www.binance.org',
//     shortName: 'bnb',
//     nativeCurrency: { name: 'Binance Chain Native Token', symbol: 'BNB', decimals: 18 },
//     faucets: [ 'https://free-online-app.com/faucet-for-eth-evm-chains/' ]
//   }

export type ChainType = {
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

export const ChainSelectorModal = () => {
  const [loading] = useState(false)
  const { chainSelector } = useModal()
  const { close, isOpen } = chainSelector

  const [chains, setChains] = useState<ChainType[]>()
  const [lastSearch, setLastSearch] = useState(0)
  const [pioneer, setPioneer] = useState<any>()

  const { register, setValue, control } = useForm<{ search: string }>({
    mode: 'onChange',
    defaultValues: { search: '' },
  })

  const search = useWatch({ control, name: 'search' })

  const fetchChains = useCallback(async () => {
    let test = await pioneer.AtlasNetwork()
    console.log(test)
  }, [pioneer])

  const setupPioneer = async () => {
    try {
      let spec = getConfig().REACT_APP_DAPP_URL
      let config = {
        queryKey: 'key:public',
        username: 'user:public',
        spec,
      }
      let pioneer = new Client(spec, config)
      pioneer = await pioneer.init()

      setPioneer(pioneer)
    } catch (e) {
      console.error(' e: ', e)
    }
  }

  useEffect(() => {
    setupPioneer()
    // fetchChains()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setLastSearch(Date.now())
    if (search === '' || !search) return
    if (Date.now() - lastSearch < 2000) return
    pioneer.SearchByNetworkName(search).then((info: { data: any }) => {
      setChains([info.data])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  console.log('pioneer', pioneer)

  return (
    <SlideTransition>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          ipcRenderer.send('unlockWindow', {})
          close()
        }}
        isCentered
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
          <ModalCloseButton ml='auto' borderRadius='full' position='static' />
          <ModalHeader>
            <Text translation={'Select chain'} />
          </ModalHeader>
          <ModalBody>
            <Stack spacing={4} mb={4}>
              <Box>
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <SearchIcon color='gray.700' />
                  </InputLeftElement>
                  <Input
                    {...register('search')}
                    autoComplete='off'
                    type='text'
                    placeholder='Search'
                    pl={10}
                    variant='filled'
                  />
                </InputGroup>
              </Box>
              {chains && chains.map(chain => <Box>{chain.symbol}</Box>)}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SlideTransition>
  )
}
