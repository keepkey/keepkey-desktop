import { Button, Image, Spinner } from '@chakra-ui/react'
import { ipcRenderer } from 'electron'
import { useEffect, useState } from 'react'
import KeepKeyConnect from 'assets/hold-and-connect.svg'
import KeepKeyRelease from 'assets/hold-and-release.svg'
import { Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import { getAssetUrl } from 'lib/getAssetUrl'

import { Row } from '../../../components/Row/Row'

export const FirmwareModal = () => {
  const { keepkey } = useWallet()

  const [kkConnect, setKKConnect] = useState(KeepKeyConnect)
  const [kkRelease, setKKRelease] = useState(KeepKeyRelease)

  useEffect(() => {
    getAssetUrl(KeepKeyConnect).then(setKKConnect)
    getAssetUrl(KeepKeyRelease).then(setKKRelease)
  }, [])

  const HandleUpdateFirmware = async () => {
    console.info('Updating firmware (firmware modal)')
    // setLoadingFirmware(true)
    ipcRenderer.send('@keepkey/update-firmware', {})
  }

  return (
    <div>
      {false ? (
        <div>
          <Spinner />
        </div>
      ) : (
        <div>
          {keepkey.isInUpdaterMode ? (
            <div>
              <Text translation={'modals.firmware.firmwareUpdate'} />
              <small>click to perform action</small>
              <Button isFullWidth size='lg' colorScheme='blue' onClick={HandleUpdateFirmware}>
                <Text translation={'modals.firmware.continue'} />
              </Button>
              <Image src={kkRelease} alt='Approve Transaction On Device!' />
            </div>
          ) : (
            <div>
              <Row>
                <Row.Label>
                  <Text translation={'modals.firmware.bootloader'} />
                </Row.Label>
                <Row.Value>{keepkey?.bootloaderVersion}</Row.Value>
              </Row>
              <Row>
                <Row.Label>
                  <Text translation={'modals.firmware.firmware'} />
                </Row.Label>
                <Row.Value>{keepkey?.firmwareVersion}</Row.Value>
              </Row>
              <Image src={kkConnect} alt='Approve Transaction On Device!' />
              <small>
                <Text translation={'modals.firmware.cta'} />
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
