import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Divider,
  Flex,
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
  Spinner,
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
import { getPioneerClient } from 'lib/getPioneerCleint'
import { debounce } from 'lodash'
import type { ServiceType } from './mergeServices'
import { mergeServices } from './mergeServices'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { web3ByServiceType } from 'context/WalletProvider/web3byChainId'

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

export const ChainSelectorModal = () => {
  const [loading, setLoading] = useState(false)
  const { chainSelector } = useModal()
  const { close, isOpen } = chainSelector

  const [chains, setChains] = useState<ServiceType[]>()
  const { legacyBridge, isLegacy } = useWalletConnect()

  const { register, control } = useForm<{ search: string }>({
    mode: 'onChange',
    defaultValues: { search: '' },
  })

  const search = useWatch({ control, name: 'search' })

  const fetchChains = async () => {
    setLoading(true)
    const pioneer = await getPioneerClient()
    let test = await pioneer.AtlasNetwork()
    setLoading(false)
    setChains(mergeServices(test.data))
  }

  useEffect(() => {
    fetchChains()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const useDebounce = (value, delay) => {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(
      () => {
        // Update debounced value after delay
        const handler = setTimeout(() => {
          setDebouncedValue(value)
        }, delay)

        // Cancel the timeout if value changes (also on delay change or unmount)
        // This is how we prevent debounced value from updating if value is changed ...
        // .. within the delay period. Timeout gets cleared and restarted.
        return () => {
          clearTimeout(handler)
        }
      },
      [value, delay], // Only re-call effect if value or delay changes
    )

    return debouncedValue
  }

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    if (debouncedSearch === '' || !debouncedSearch) {
      fetchChains()
      return
    }
    setLoading(true)
    getPioneerClient().then(pioneer => {
      pioneer.SearchByNetworkName(debouncedSearch).then((info: { data: any }) => {
        setLoading(false)
        setChains(mergeServices(info.data))
      })
    })
  }, [debouncedSearch])

  console.log(chains)

  const switchChain = useCallback(
    (service: ServiceType) => {
      if (!isLegacy) return
      legacyBridge?.doSwitchChain({
        chainId: service.chainId,
      })
      close()
    },
    [close, isLegacy, legacyBridge],
  )

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
              {loading && (
                <Flex alignContent='center' w='full' h='full' justifyItems='center'>
                  <Spinner />
                </Flex>
              )}
              {!loading &&
                chains &&
                chains.map(chain => (
                  <Box as='button' onClick={() => switchChain(chain)}>
                    {chain.name}
                    <Divider pb={2} />
                  </Box>
                ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SlideTransition>
  )
}
