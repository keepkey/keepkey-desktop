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
  Stack,
  Text as PlainText,
  VStack,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react'
import type { FC } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useHistory } from 'react-router'
import { Card } from 'components/Card/Card'
import { Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import { useWallet } from 'hooks/useWallet/useWallet'

import type { RegistryItem } from '../types'
import { PageInput } from './PageInput'
import { getPioneerClient } from 'lib/getPioneerCleint'

const PAGE_SIZE = 20
const loadingImg = 'https://github.com/BitHighlander/keepkey-desktop/raw/master/electron/icon.png'

export const DappRegistryGrid: FC = () => {
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>()
  const [loading, setLoading] = useState(true)

  const { register, setValue, control } = useForm<{ search: string; page: number }>({
    mode: 'onChange',
    defaultValues: { search: '', page: 0 },
  })

  const search = useWatch({ control, name: 'search' })
  const page = useWatch({ control, name: 'page' })
  useEffect(() => setValue('page', 0), [search, setValue])
  const history = useHistory()
  const { dispatch } = useWallet()

  const filteredListings = useMemo(
    () =>
      registryItems &&
      registryItems.filter(
        registryItem => !search || registryItem.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, registryItems],
  )

  let findDapps = async function () {
    try {
      setLoading(true)
      const pioneer = await getPioneerClient()
      let dapps = await pioneer.ListApps({ limit: 30, skip: 0 })
      setRegistryItems(dapps.data)
      setLoading(false)
    } catch (e) {
      console.error(' e: ', e)
    }
  }
  useEffect(() => {
    findDapps()
  }, [])

  const maxPage = filteredListings ? Math.floor(filteredListings.length / PAGE_SIZE) : 0

  const openDapp = (app: RegistryItem) => {
    dispatch({ type: WalletActions.SET_BROWSER_URL, payload: app.homepage })
    history.push('/browser')
  }

  return (
    <Box>
      <Stack direction='row' alignItems='center' mb={4}>
        <Heading flex={1} fontSize='2xl'>
          <Text translation='plugins.walletConnectToDapps.registry.availableDapps' />
        </Heading>
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
        <PageInput value={page} max={maxPage} onChange={value => setValue('page', value)} />
      </Stack>
      {loading && (
        <SimpleGrid columns={{ lg: 4, sm: 2, base: 1 }} spacing={4}>
          {Array.from(Array(10).keys()).map((_i, idx) => (
            <Box
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
        <SimpleGrid columns={{ lg: 4, sm: 2, base: 1 }} spacing={4}>
          {filteredListings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(listing => (
            <Link key={listing.id} onClick={() => openDapp(listing)}>
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
                  <PlainText fontWeight='semibold'>{listing.name}</PlainText>
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
