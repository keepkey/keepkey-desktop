const KK_SDK_API_KEY = 'API_KEY_HERE'

const fetchEthAddress = (resolve, reject) => {
  fetch('http://localhost:1646/addresses/eth', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KK_SDK_API_KEY}`,
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      show_display: false,
      address_n: [2147483692, 2147483708, 2147483648, 0, 0],
    }),
  })
    .then(resp => {
      resp.json().then(({ address }) => resolve(address))
    })
    .catch(reject)
}

window.ethereum = {
  isMetaMask: true,

  request: ({ method, params }) =>
    new Promise((resolve, reject) => {
      console.log('[INJECTED] REQUEST FUNCTION CALLED: ', method, params)
      switch (method) {
        case 'eth_requestAccounts':
          fetchEthAddress(resolve, reject)
          break
        case 'eth_accounts':
          fetchEthAddress(resolve, reject)
          break
        default:
          break
      }
    }),

  // Enable provider (deprecated, use request('eth_requestAccounts') instead)
  enable: () => {},

  on: (eventName, callback) => {
    console.log('[INJECTED] ON FUNCTION CALLED: ', eventName, callback)
  },

  removeListener: (eventName, callback) => {
    console.log('[INJECTED] REMOVE LISTENER FUNCTION CALLED: ', eventName, callback)
  },

  close: () => {
    console.log('[INJECTED] CLOSE FUNCTION CALLED: ')
  },

  chainId: '0x1',

  selectedAddress: '0x2356A15042F98f0a53784F42237bd4b2873AADCF',

  isConnected: false,
}
