import {
  Box,
  Divider,
  Flex,
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
// import { SessionTypes } from '@walletconnect/types'
import { ipcRenderer } from 'electron-shim'
import { useCallback, useEffect, useState } from 'react'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import { useForm, useWatch } from 'react-hook-form'
import { SearchIcon } from '@chakra-ui/icons'
import { getPioneerClient } from 'lib/getPioneerCleint'
import type { ServiceType } from './mergeServices'
import { mergeServices } from './mergeServices'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useDebounce } from 'hooks/useDebounce/useDebounce'

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
