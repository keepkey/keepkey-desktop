import { Heading, Stack, StackDivider } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Card } from 'components/Card/Card'
import { Main } from 'components/Layout/Main'
import { RawText, Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'

const AuthenticatorHeader = () => {
  return (
    <Stack pb={4}>
      <Heading>Authenticator</Heading>
    </Stack>
  )
}

export const Authenticator = () => {
  const {
    state: { wallet },
  } = useWallet()

  const [res, setRes] = useState('')

  useEffect(() => {
    if (!wallet) return // msg = {"\x17" "getAccount:<slot>"};
    // self.sendMsg(client, msg = b'\x17' + bytes("getAccount:"+str(ctr), 'utf8'))
    const msg: Uint8Array = new Uint8Array([0x17])
    const ctrString: string = `getAccount:1`
    const ctrBytes: Uint8Array = new TextEncoder().encode(ctrString)
    const combined: Uint8Array = new Uint8Array([...msg, ...ctrBytes])
    console.log('combined arr', combined)
    // @ts-ignore
    ;(wallet as KeepKeyHDWallet).ping({ msg: combined }).then(data => {
      const bytes = data.msg.split(',').map(Number)
      const str = new TextDecoder().decode(Uint8Array.from(bytes))
      console.log('ACCOUNTS: ', str) // Output: "getAccount:1"
      setRes(str)
    })
  }, [wallet])

  return (
    <Main titleComponent={<AuthenticatorHeader />}>
      <Card flex={1}>
        <Card.Header>
          <Stack pb={4}>
            <Heading>
              <Text translation={'authenticator.header'} />
            </Heading>
          </Stack>
        </Card.Header>
        <Card.Body>
          <Stack divider={<StackDivider />}>
            <RawText>{res}</RawText>
          </Stack>
        </Card.Body>
      </Card>
    </Main>
  )
}
