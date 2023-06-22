window.ethereum = {
  isMetaMask: true,

  request: ({ method, params }) => {
    console.log('[INJECTED] REQUEST FUNCTION CALLED: ', method, params)
    switch (method) {
      case 'eth_requestAccounts':
        return ['0x2356A15042F98f0a53784F42237bd4b2873AADCF']
      case 'eth_accounts':
        return ['0x2356A15042F98f0a53784F42237bd4b2873AADCF']

      default:
        break
    }
  },

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
