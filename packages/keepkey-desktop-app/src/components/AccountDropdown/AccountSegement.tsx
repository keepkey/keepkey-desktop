import { Stack } from '@chakra-ui/react'
import { RawText } from 'components/Text'
import { type FC } from 'react'

type AccountGroupProps = {
  title: string
  subtitle?: string
}

export const AccountSegment: FC<AccountGroupProps> = ({ title, subtitle }) => (
  <Stack
    direction='row'
    px={4}
    py={2}
    color='gray.500'
    fontSize='sm'
    fontWeight='bold'
    justifyContent='space-between'
  >
    <RawText>{title}</RawText>
    {subtitle && <RawText fontFamily='monospace'>{subtitle}</RawText>}
  </Stack>
)
