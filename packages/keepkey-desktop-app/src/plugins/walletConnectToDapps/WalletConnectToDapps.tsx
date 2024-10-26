import { Container } from '@chakra-ui/react'
import type { FC } from 'react'
import { DappRegistryGrid } from './components/DappRegistryGrid'

export const WalletConnectToDapps: FC = () => {
    return (
        <Container p={4} maxW="container.lg" display="flex" alignItems="center" mt={20}>
            <DappRegistryGrid />
        </Container>
    )
}
