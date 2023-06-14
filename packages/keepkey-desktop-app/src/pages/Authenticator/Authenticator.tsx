import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Code,
  Flex,
  Heading,
  HStack,
  Spinner,
  Stack,
  StackDivider,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  ListItem,
  UnorderedList,
  Input,
  IconButton,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { Card } from 'components/Card/Card'
import { Main } from 'components/Layout/Main'
import { Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useEffect, useState } from 'react'

function assume<T>(_x: unknown): asserts _x is T {}

export type AuthenticatorAccount = { slotIdx: number; domain: string; account: string }

const PasswordGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const [show, setShow] = useState(false); // state for show/hide password

  const sampleData = [
    { type: 'password', value: 'P@ssw0rd' },
    { type: 'mnemonic', value: 'apple banana cherry' },
    // more sample data...
  ];

  const handleClick = () => setShow(!show); // function for toggling show/hide

  return (
      <Card flex={1}>
        <Card.Body>
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Value</Th>
                <Th>URL</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sampleData.map((item, index) => (
                  <Tr key={index}>
                    <Td>{item.name}</Td>
                    <Td>{item.type}</Td>
                    <Td>
                      <Input type={show ? "text" : "password"} value={item.value} readOnly />
                      <IconButton aria-label="Show/Hide Password" onClick={handleClick} icon={show ? <ViewOffIcon /> : <ViewIcon />} />
                    </Td>
                    <Td>{item.url}</Td>
                  </Tr>
              ))}
            </Tbody>
          </Table>
        </Card.Body>
        <Card.Footer>
          <Button colorScheme="green" onClick={() => setIsOpen(true)}>
            Generate Password
          </Button>
        </Card.Footer>

        <AlertDialog
            isOpen={isOpen}
            onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Generate Password or Mnemonic
              </AlertDialogHeader>

              <AlertDialogBody>
                <UnorderedList>
                  {sampleData.map((item, index) => (
                      <ListItem key={index}>{`${item.name} (${item.type}): ${item.value}`}</ListItem>
                  ))}
                </UnorderedList>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button onClick={onClose}>
                  Close
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Card>
  );
};


export const Authenticator = () => {

  const {
    state: { wallet, authenticatorError },
    dispatch,
  } = useWallet()

  const sampleData:any = [
    { type: 'password', value: 'P@ssw0rd' },
    { type: 'mnemonic', value: 'apple banana cherry' },
    // more sample data...
  ];
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const [accounts, setAccounts] = useState<AuthenticatorAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [supportsFeature, setSupportsFeature] = useState(false)
  const { addAuthenticatorAccount } = useModal()
  const toast = useToast()

  useEffect(() => {
    if (!wallet) return

    assume<KeepKeyHDWallet>(wallet)

    wallet.getFirmwareVersion().then((version: { replace: (arg0: string, arg1: string) => { (): any; new(): any; split: { (arg0: string): [any, any]; new(): any } } }) => {
      const [major, minor] = version.replace('v', '').split('.')
      if (Number(major) >= 7 && Number(minor) >= 6) setSupportsFeature(true)
    })
  }, [wallet])

  useEffect(() => {
    if (!supportsFeature) setLoading(false)
    else setLoading(true)
  }, [supportsFeature])

  const fetchAccs = useCallback(async () => {
    if (!wallet || !supportsFeature) return

    assume<KeepKeyHDWallet>(wallet)

    setLoading(true)
    setAccounts([])

    for (let slotIdx = 0; slotIdx < 20; slotIdx++) {
      const msg = `\x17getAccount:${slotIdx}`
      console.log('getAccount msg: ', msg)

      const data = await wallet.ping({ msg }).catch(e => console.log('error', e))
      if (!data || !data.msg || data.msg === '') continue
      console.log(slotIdx, data)
      const [domain, account] = data.msg.split(':')
      setAccounts((accs: any[]) => {
        if (accs.length === 0) return [{ slotIdx, domain, account }]
        const exists = accs.find(acc => acc.slotIdx === slotIdx)
        if (exists) return accs
        return [...accs, { slotIdx, domain, account }]
      })
    }

    setLoading(false)
  }, [wallet, supportsFeature])

  useEffect(() => {
    fetchAccs()
  }, [fetchAccs])

  useEffect(() => {
    if (!authenticatorError) return
    dispatch({ type: WalletActions.SET_AUTHENTICATOR_ERROR, payload: null })
    toast({ status: 'error', title: 'Authenticator Error', description: authenticatorError })
  }, [authenticatorError, dispatch, toast])

  const deleteAcc = useCallback(
    async (acc: AuthenticatorAccount) => {
      if (!wallet || !supportsFeature) return

      assume<KeepKeyHDWallet>(wallet)

      const msg = `\x18removeAccount:${acc.domain}:${acc.account}`
      console.log('removeAccount msg: ', msg)

      toast({
        status: 'info',
        title: 'Confirm on KeepKey',
        description: `Please confirm deleting account on your KeepKey`,
      })
      await wallet.ping({ msg }).catch(console.error)
      fetchAccs()
    },
    [wallet, toast, fetchAccs, supportsFeature],
  )

  const generateOtp = useCallback(
    async (acc: AuthenticatorAccount, timeSlice: number, timeRemain: number) => {
      if (!wallet || !supportsFeature) return

      assume<KeepKeyHDWallet>(wallet)

      const msg = `\x16generateOTPFrom:${acc.domain}:${acc.account}:${timeSlice.toString(
        10,
      )}:${timeRemain}`
      console.log('generateOtp msg: ', msg)

      const finished = wallet
        .ping({
          msg,
        })
        .catch(console.error)

      toast({
        status: 'info',
        title: 'OTP generated',
        description: `Please check the OTP on your keepkey`,
      })

      await finished
    },
    [wallet, toast, supportsFeature],
  )

  const wipeData = useCallback(async () => {
    if (!wallet || !supportsFeature) return

    assume<KeepKeyHDWallet>(wallet)

    const msg = `\x19wipeAuthdata:`
    console.log('removeAccount msg: ', msg)

    await wallet.ping({ msg }).catch(console.error)
    toast({
      status: 'info',
      title: 'Data wiped',
      description: `Authenticator data wiped`,
    })
    fetchAccs()
  }, [wallet, toast, fetchAccs, supportsFeature])

  return (
    <Main
      titleComponent={
        <Stack pb={4}>
          <Heading>
            <Text translation={'authenticator.heading'} />
          </Heading>
        </Stack>
      }
    >
      <Card flex={1}>
        <Card.Header>
          <Stack pb={4} gap={4}>
            {!supportsFeature && (
              <Alert status='error'>
                <AlertIcon />
                <AlertTitle>
                  <Text translation='authenticator.unsupported.title' />
                </AlertTitle>
                <AlertDescription display='inline-flex'>
                  <Text pr={2} translation='authenticator.unsupported.description1' />
                  <Code>v7.6.0</Code>
                  <Text translation='authenticator.unsupported.description2' pl={2} />
                </AlertDescription>
              </Alert>
            )}
            <HStack>
              <Heading>
                <Text translation={'authenticator.header'} />
              </Heading>
              <Flex w='full' flexDirection='row-reverse' gap={4}>
                <Button size='sm' colorScheme='blue' disabled={loading} onClick={wipeData}>
                  <Text translation={'authenticator.cta.wipeData'} />
                </Button>
                <Button size='sm' colorScheme='blue' disabled={loading} onClick={fetchAccs}>
                  <Text translation={'authenticator.cta.refresh'} />
                </Button>
                <Button
                  size='sm'
                  colorScheme='blue'
                  disabled={loading}
                  onClick={() => addAuthenticatorAccount.open({ fetchAccs })}
                >
                  <Text translation={'authenticator.cta.addAcc'} />
                </Button>
              </Flex>
            </HStack>
          </Stack>
        </Card.Header>
        <Card.Body>
          <Stack divider={<StackDivider />}>
            {loading && <Spinner />}
            {!loading && accounts.length !== 0 && (
              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>
                        <Text translation={'authenticator.account'} />
                      </Th>
                      <Th>
                        <Text translation={'authenticator.cta.generateOtp'} />
                      </Th>
                      <Th>
                        <Text translation={'authenticator.cta.deleteAcc'} />
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {accounts &&
                      accounts.map((acc: { domain: string; account: any }) => (
                        <Tr>
                          <Td>
                            <Code>{`${acc.domain.trim() ? `${acc.domain}:` : ''}${
                              acc.account
                            }`}</Code>
                          </Td>
                          <Td>
                            <Button
                              size='sm'
                              colorScheme='green'
                              onClick={() => {
                                const interval = 30
                                const currTime = Date.now() / 1000
                                const timeSlice = Math.floor(currTime / interval)
                                const timeRemain = interval - Math.floor(currTime - timeSlice * 30)
                                generateOtp(acc, timeSlice, Math.floor(timeRemain))
                              }}
                            >
                              <Text translation={'authenticator.cta.generateOtp'} />
                            </Button>
                          </Td>
                          <Td>
                            <Button size='sm' colorScheme='red' onClick={() => deleteAcc(acc)}>
                              <Text translation={'authenticator.cta.deleteAcc'} />
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
            {!loading && accounts.length === 0 && <Text translation={'authenticator.noAccounts'} />}
          </Stack>
        </Card.Body>
      </Card>
      <PasswordGenerator />
    </Main>
  )
}
