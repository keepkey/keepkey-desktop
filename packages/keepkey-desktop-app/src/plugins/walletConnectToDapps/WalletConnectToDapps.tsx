import { Container } from '@chakra-ui/react'
import type { FC } from 'react'
import { DappRegistryGrid } from './components/DappRegistryGrid'

export const WalletConnectToDapps: FC = () => {
    return (
        <Container
            p={{ base: 2, md: 4 }}
            maxW={{ base: "100%", md: "container.md", lg: "container.lg" }}
            display="flex"
            alignItems="center"
            mt={{ base: 10, md: 16, lg: 20 }}
        >
            <DappRegistryGrid />
        </Container>
    )
}
