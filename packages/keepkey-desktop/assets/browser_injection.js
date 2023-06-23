const KK_SDK_API_KEY = 'API_KEY_HERE';

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
    .then((resp) => {
      resp.json().then(({ address }) => resolve(address));
    })
    .catch(reject);
};

const fetchChainId = (resolve, reject) => {
  resolve('0x1');
};

window.ethereum = {
  isMetaMask: true,

  request: ({ method, params }) =>
    new Promise((resolve, reject) => {
      console.log('[INJECTED] REQUEST FUNCTION CALLED: ', method, params);
      switch (method) {
        case 'eth_chainId':
          fetchChainId(resolve, reject);
          break;
        case 'eth_requestAccounts':
          fetchEthAddress(resolve, reject);
          break;
        case 'eth_accounts':
          fetchEthAddress(resolve, reject);
          break;
        case 'wallet_addEthereumChain':
          resolve('Successfully added Ethereum chain.');
          break;
        case 'wallet_switchEthereumChain':
          resolve('Successfully switched Ethereum chain.');
          break;
        case 'eth_sendTransaction':
          resolve('Transaction sent successfully.');
          break;
        case 'wallet_watchAsset':
          resolve('Asset added to wallet successfully.');
          break;
        case 'wallet_requestPermissions':
          resolve([{ eth_accounts: {} }]);
          break;
        case 'wallet_getPermissions':
          resolve([{ eth_accounts: {} }]);
          break;
        case 'eth_accounts':
          fetchEthAddress(resolve, reject);
          break;
        case 'eth_getEncryptionPublicKey':
          resolve('Encryption public key');
          break;
        case 'eth_decrypt':
          resolve('Decrypted data');
          break;
        case 'eth_sign':
          resolve('Signature');
          break;
        case 'personal_sign':
          resolve('Personal signature');
          break;
        case 'personal_ecRecover':
          resolve('Recovered address');
          break;
        case 'eth_signTypedData':
          resolve('Typed data signature');
          break;
        case 'eth_signTypedData_v3':
          resolve('Typed data v3 signature');
          break;
        case 'eth_signTypedData_v4':
          resolve('Typed data v4 signature');
          break;
        case 'net_version':
          resolve('Network version');
          break;
        case 'eth_getBlockByNumber':
          resolve('Block data');
          break;
        default:
          reject(`Method ${method} not supported.`);
          break;
      }
    }),

  // Enable provider (deprecated, use request('eth_requestAccounts') instead)
  enable: () => {},

  on: (eventName, callback) => {
    console.log('[INJECTED] ON FUNCTION CALLED: ', eventName, callback);
  },

  removeListener: (eventName, callback) => {
    console.log('[INJECTED] REMOVE LISTENER FUNCTION CALLED: ', eventName, callback);
  },

  close: () => {
    console.log('[INJECTED] CLOSE FUNCTION CALLED: ');
  },

  chainId: '0x1',

  selectedAddress: '0x2356A15042F98f0a53784F42237bd4b2873AADCF',

  isConnected: false,
};
