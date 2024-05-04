import { Main } from 'components/Layout/Main'

import { Webview } from './Webview';

export const Browser = () => {

  return (
      <Main
          height='full'
          style={{
            padding: 0,
            minWidth: '100%',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
      >
        <Webview />
      </Main>
  )
}
