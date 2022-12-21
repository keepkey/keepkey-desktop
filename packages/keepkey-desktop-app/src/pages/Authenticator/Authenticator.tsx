import {
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
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { Card } from 'components/Card/Card'
import { Main } from 'components/Layout/Main'
import { Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { useModal } from 'hooks/useModal/useModal'

function assume<T>(_x: unknown): asserts _x is T {}

export type AuthenticatorAccount = { slotIdx: number; domain: string; account: string }

export const Authenticator = () => {
  const {
    state: { wallet },
  } = useWallet()

  const [accounts, setAccounts] = useState<AuthenticatorAccount[]>([])
  const [loading, setLoading] = useState(true)
  const { addAuthenticatorAccount } = useModal()
  const toast = useToast()

  const fetchAccs = useCallback(async () => {
    if (!wallet) return

    assume<KeepKeyHDWallet>(wallet)

    setLoading(true)
    setAccounts([])

    for (let slotIdx = 0; slotIdx < 11; slotIdx++) {
      const msg = `\x17getAccount:${slotIdx}`
      console.log('getAccount msg: ', msg)

      const data = await wallet.ping({ msg }).catch(e => console.log('error', e))
      if (!data) continue
      console.log(slotIdx, data)
      const [domain, account] = data.msg.split(':')
      setAccounts(accs => {
        if (accs.length === 0) return [{ slotIdx, domain, account }]
        const exists = accs.find(acc => acc.slotIdx === slotIdx)
        if (exists) return accs
        return [...accs, { slotIdx, domain, account }]
      })
    }

    setLoading(false)
  }, [wallet])

  useEffect(() => {
    fetchAccs()
  }, [fetchAccs])

  const deleteAcc = useCallback(
    async (acc: AuthenticatorAccount) => {
      if (!wallet) return

      assume<KeepKeyHDWallet>(wallet)

      const msg = `\x18removeAccount:${acc.domain}:${acc.account}`
      console.log('removeAccount msg: ', msg)

      await wallet.ping({ msg }).catch(console.error)
      toast({
        status: 'info',
        title: 'Account deleted',
        description: `Account ${acc.domain}:${acc.account} deleted`,
      })
      setTimeout(fetchAccs, 2000)
    },
    [wallet, toast, fetchAccs],
  )

  const generateOtp = useCallback(
    async (acc: AuthenticatorAccount, timeSlice: number, timeRemain: number) => {
      if (!wallet) return

      assume<KeepKeyHDWallet>(wallet)

      const msg = `\x16generateOTPFrom:${acc.domain}:${acc.account}:${timeSlice.toString(
        10,
      )}:${timeRemain}`
      console.log('generateOtp msg: ', msg)

      await wallet
        .ping({
          msg,
        })
        .catch(console.error)
      toast({
        status: 'info',
        title: 'OTP generated',
        description: `Please check the OTP on your keepkey`,
      })
    },
    [wallet, toast],
  )

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
          <Stack pb={4}>
            <HStack>
              <Heading>
                <Text translation={'authenticator.header'} />
              </Heading>
              <Flex w='full' flexDirection='row-reverse' gap={4}>
                <Button size='sm' colorScheme='blue' disabled={loading} onClick={() => fetchAccs()}>
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
                        <Text translation={'authenticator.actions'} />
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {accounts &&
                      accounts.map(acc => (
                        <Tr>
                          <Td>
                            <Code>
                              {acc.domain}:{acc.account}
                            </Code>
                          </Td>
                          <Td>
                            <HStack gap={4}>
                              <Button
                                size='sm'
                                colorScheme='green'
                                onClick={() => {
                                  const interval = 30
                                  const currTime = Date.now() / 1000
                                  const timeSlice = Math.floor(currTime / interval)
                                  const timeRemain =
                                    interval - Math.floor(currTime - timeSlice * 30)
                                  generateOtp(acc, timeSlice, Math.floor(timeRemain))
                                }}
                              >
                                <Text translation={'authenticator.cta.generateOtp'} />
                              </Button>
                              <Button size='sm' colorScheme='red' onClick={() => deleteAcc(acc)}>
                                <Text translation={'authenticator.cta.deleteAcc'} />
                              </Button>
                            </HStack>
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
    </Main>
  )
}
