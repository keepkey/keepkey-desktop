import { SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Heading,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Stack,
  Text as PlainText,
  VStack,
} from '@chakra-ui/react'
import kkIconBlack from 'assets/kk-icon-black.png'
import { Card } from 'components/Card/Card'
import { Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import { ipcListeners } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { getPioneerClient } from 'lib/getPioneerClient'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useHistory } from 'react-router'
import type { RegistryItem } from '../types'
import { PageInput } from './PageInput'

const TAG = ' | DappRegistryGrid.tsx | '
const PAGE_SIZE = 20
const loadingImg = kkIconBlack

export const DappRegistryGrid: FC = () => {
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>()
  const [loading, setLoading] = useState(true)

  const {
    state: { wallet },
  } = useWallet()
  const { dappClick } = useModal()

  const { register, setValue, control } = useForm<{ search: string; page: number }>({
    mode: 'onChange',
    defaultValues: { search: '', page: 0 },
  })

  const search = useWatch({ control, name: 'search' })
  const page = useWatch({ control, name: 'page' })
  useEffect(() => setValue('page', 0), [search, setValue])
  const history = useHistory()
  const { dispatch } = useWallet()

  const [supportsVerify, setSupportsVerify] = useState(false)

  useEffect(() => {
    wallet?.getFirmwareVersion().then(version => {
      const [major, minor] = version.replace('v', '').split('.')
      if (Number(major) >= 7 && Number(minor) >= 6) setSupportsVerify(true)
    })
  }, [wallet])

  const filteredListings = useMemo(
      () =>
          registryItems &&
          registryItems.filter(
              registryItem => !search || registryItem.name.toLowerCase().includes(search.toLowerCase()),
          ),
      [search, registryItems],
  )

  const findDapps = async () => {
    try {
      setLoading(true)
      const pioneer = await getPioneerClient()
      let version = await ipcListeners.appVersion()
      console.log('version: ', version)
      let dapps = await pioneer.ListAppsByVersion({ minVersion: version, limit: 1000, skip: 0 })

      const sortByScore = (arr: any[]) => {
        arr.sort((a, b) => (b.score || 0) - (a.score || 0))
        return arr.filter(el => el.score >= 0)
      }

      dapps = sortByScore(dapps.data)
      setRegistryItems(dapps)
      setLoading(false)
    } catch (e) {
      console.error(' e: ', e)
    }
  }

  useEffect(() => {
    findDapps()
  }, [])

  const maxPage = filteredListings ? Math.floor(filteredListings.length / PAGE_SIZE) : 0

  const openDapp = useCallback(
      (app: RegistryItem) => {
        console.log(TAG, 'openDapp app: ', app)
        history.push('/browser')
        setTimeout(() => {
          dispatch({ type: WalletActions.SET_BROWSER_URL, payload: app.homepage })
        }, 2000)
      },
      [dispatch, history],
  )

  const clickDapp = useCallback(
      (app: RegistryItem) => {
        console.log('Dapp clicked', app)
        if (supportsVerify) dappClick.open({ onContinue: () => openDapp(app) })
        else openDapp(app)
      },
      [dappClick, openDapp],
  )

  return (
      <Box>
        <Stack direction='row' alignItems='center' mb={4} flexWrap="wrap">
          <Heading flex={{ base: '100%', md: 1 }} fontSize={{ base: 'xl', md: '2xl' }}>
            <Text translation='plugins.walletConnectToDapps.registry.availableDapps' />
          </Heading>
          <Box w={{ base: '100%', md: 'auto' }} mt={{ base: 2, md: 0 }}>
            <InputGroup size="sm">
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
                  size={{ base: 'sm', md: 'md' }}
              />
            </InputGroup>
          </Box>
          <PageInput value={page} max={maxPage} onChange={value => setValue('page', value)} />
        </Stack>
        {loading && (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
              {Array.from(Array(PAGE_SIZE).keys()).map((_i, idx) => (
                  <Box
                      key={`loading_${idx}`}
                      borderRadius='lg'
                      p={2}
                      position='relative'
                      overflow='hidden'
                      _hover={{ opacity: 0.8, transition: 'opacity 0.2s ease-in-out' }}
                  >
                    <Image
                        src={loadingImg}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          filter: 'blur(20px)',
                          opacity: 0.3,
                          zIndex: -1,
                        }}
                    />
                    <Stack direction='row' alignItems='center'>
                      <Skeleton key={idx} isLoaded={!loading} boxSize='48px'>
                        <Image borderRadius='full' boxSize='48px' m={2} src={loadingImg} />
                      </Skeleton>
                      <SkeletonText noOfLines={1} isLoaded={!loading}>
                        <PlainText fontWeight='semibold'>Fake name</PlainText>
                      </SkeletonText>
                    </Stack>
                  </Box>
              ))}
            </SimpleGrid>
        )}
        {filteredListings && filteredListings.length !== 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
              {filteredListings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(listing => (
                  <Link key={listing.id} onClick={() => clickDapp(listing)}>
                    <Box
                        borderRadius='lg'
                        p={2}
                        position='relative'
                        overflow='hidden'
                        _hover={{ opacity: 0.8, transition: 'opacity 0.2s ease-in-out' }}
                    >
                      <Image
                          src={listing.image}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            filter: 'blur(20px)',
                            opacity: 0.3,
                            zIndex: -1,
                          }}
                      />
                      <Stack direction='row' alignItems='center'>
                        <Image borderRadius='full' boxSize='48px' m={2} src={listing.image} />
                        <PlainText fontWeight='semibold' fontSize={{ base: 'sm', md: 'md' }}>
                          {listing.name}
                        </PlainText>
                      </Stack>
                    </Box>
                  </Link>
              ))}
            </SimpleGrid>
        ) : (
            !loading && (
                <VStack alignItems='center' p={8} spacing={0}>
                  <Card
                      display='grid'
                      width={14}
                      height={14}
                      placeItems='center'
                      borderRadius='2xl'
                      borderWidth={0}
                      mb={4}
                  >
                    <SearchIcon color='gray.500' fontSize='xl' />{' '}
                  </Card>
                  <Text translation='common.noResultsFound' fontWeight='medium' fontSize='lg' />
                  <Text
                      translation='plugins.walletConnectToDapps.registry.emptyStateDescription'
                      color='gray.500'
                  />
                </VStack>
            )
        )}
      </Box>
  )
}
