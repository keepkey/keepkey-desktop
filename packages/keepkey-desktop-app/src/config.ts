import * as envalid from 'envalid'
import { bool } from 'envalid'
import forEach from 'lodash/forEach'
import memoize from 'lodash/memoize'
import { str, url } from 'envalid'
import type { ReporterOptions } from 'envalid'

const { cleanEnv } = envalid

// add validators for each .env variable
// note env vars must be prefixed with REACT_APP_
const validators = {
  REACT_APP_LOG_LEVEL: str({ default: 'info' }),
  REACT_APP_ALCHEMY_API_KEY: str(),
  REACT_APP_ETHEREUM_INFURA_URL: url(),
  REACT_APP_ETHEREUM_NODE_URL: url(),
  REACT_APP_KEEPKEY_UPDATER_RELEASE_PAGE: url(),
  REACT_APP_KEEPKEY_UPDATER_BASE_URL: url(),
  REACT_APP_ETHERSCAN_API_KEY: str(),
}

function reporter<T>({ errors }: ReporterOptions<T>) {
  forEach(errors, (err: Error | null, key: string) => {
    if (!err) return
    err.message = key
    // Can't use logger in src/config in tests
    // eslint-disable-next-line no-console
    console.error(err, key, 'Invalid Config')
  })
}

export const getConfig = memoize(() =>
  // @ts-ignore
  Object.freeze({ ...cleanEnv(globalThis.app_env, validators, { reporter }) }),
)
