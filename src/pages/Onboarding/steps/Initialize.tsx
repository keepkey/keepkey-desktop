import { Button } from '@chakra-ui/react'
import { useState } from 'react'
import { Text } from 'components/Text'

export const InitializeModal = () => {
  const [loading] = useState(false)

  const HandleInitNewSeed = async () => {
    // close()
  }

  const HandleRestoreSeed = async () => {
    // close()
  }

  return (
    <div>
      <Button
        isFullWidth
        size='lg'
        colorScheme='blue'
        onClick={HandleInitNewSeed}
        disabled={loading}
      >
        <Text translation={'modals.initialize.initialize'} />
      </Button>
      <Button
        isFullWidth
        size='lg'
        colorScheme='blue'
        onClick={HandleRestoreSeed}
        disabled={loading}
      >
        <Text translation={'modals.initialize.restore'} />
      </Button>
    </div>
  )
}
