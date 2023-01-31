import { SearchIcon } from '@chakra-ui/icons'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  HStack,
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
} from '@chakra-ui/react'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { web3ByServiceType } from 'context/WalletProvider/web3byChainId'
// import { SessionTypes } from '@walletconnect/types'
import { useDebounce } from 'hooks/useDebounce/useDebounce'
import { useModal } from 'hooks/useModal/useModal'
import { getPioneerClient } from 'lib/getPioneerClient'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useCallback, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { MergedServiceType } from './mergeServices'
import { mergeServices } from './mergeServices'
import { pingAndMergeServices } from './mergeServices'

export const ChainSelectorModal = () => {
  const [loading, setLoading] = useState(false)
  const { chainSelector } = useModal()
  const { close, isOpen } = chainSelector

  const [chains, setChains] = useState<MergedServiceType[]>()
  const { legacyBridge, isLegacy, setLegacyWeb3 } = useWalletConnect()

  const { register, control, setValue } = useForm<{ search: string }>({
    mode: 'onChange',
    defaultValues: { search: '' },
  })

  const search = useWatch({ control, name: 'search' })

  const fetchChains = async () => {
    setLoading(true)
    const pioneer = await getPioneerClient()
    let test = await pioneer.AtlasNetwork({ start: 1, stop: 10, limit: 5 })
    setLoading(false)
    const mergedservices = mergeServices(test.data)
    setChains(mergedservices)
    pingAndMergeServices(mergedservices).then(setChains)
  }

  useEffect(() => {
    fetchChains()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        const mergedservices = mergeServices(info.data)
        setChains(mergedservices)
        pingAndMergeServices(mergedservices).then(setChains)
      })
    })
  }, [debouncedSearch])

  const switchChain = useCallback(
    (service: MergedServiceType, serviceId = 0) => {
      if (!isLegacy) return
      const web3 = web3ByServiceType(service, serviceId)
      legacyBridge?.doSwitchChain({
        chain: web3,
      })
      setLegacyWeb3(web3)
      setValue('search', '')
      close()
    },
    [close, isLegacy, legacyBridge, setLegacyWeb3, setValue],
  )

  return (
    <SlideTransition>
      <Modal
        isOpen={isOpen}
        onClose={async () => {
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
                <Flex alignContent='right' w='full' h='full' justifyItems='center'>
                  <Spinner />
                </Flex>
              )}
              <Accordion allowMultiple>
                {!loading &&
                  chains &&
                  chains.map(chain => {
                    return (
                      <AccordionItem w='full' key={chain._id}>
                        <HStack gap={4}>
                          <Image src={chain.image} boxSize='24px' />
                          <Box
                            alignContent='right'
                            w='full'
                            as='button'
                            onClick={() => switchChain(chain)}
                          >
                            {chain.name} <small>({chain.services[0]?.latency}ms)</small>
                          </Box>
                          <Box alignContent='left'>
                            <small>chainId: {chain.chainId}</small>
                          </Box>
                          <AccordionButton w='fit-content'>
                            <AccordionIcon />
                          </AccordionButton>
                        </HStack>
                        <AccordionPanel>
                          {chain.services.map((service, idx) => (
                            <Box
                              fontSize='sm'
                              as='button'
                              onClick={() => switchChain(chain, idx)}
                              key={service.url}
                            >
                              {service.url.length > 20
                                ? service.url.substring(0, 20).concat('...')
                                : service.url}{' '}
                              ({service.latency}ms)
                              <Divider />
                            </Box>
                          ))}
                        </AccordionPanel>
                      </AccordionItem>
                    )
                  })}
              </Accordion>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SlideTransition>
  )
}
