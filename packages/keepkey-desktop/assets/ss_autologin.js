// Initialized in browser_injection.js
const KK_SDK_API_KEY = 'API_KEY_HERE'
const KK_DEVICE_ID = 'WALLET_DEVICE_ID_HERE'

console.log('LOADED SS AUTOLOGIN SCRIPT')

setTimeout(() => {
  const openRequest = indexedDB.open('localforage', 2)

  openRequest.onupgradeneeded = event => {
    const db = event.target.result
    if (!db.objectStoreNames.contains('keyvaluepairs')) {
      db.createObjectStore('keyvaluepairs')
    }
  }

  openRequest.onsuccess = event => {
    console.log('IndexedDB opened successfully')
    const db = event.target.result
    const transaction = db.transaction(['keyvaluepairs'], 'readwrite')
    const store = transaction.objectStore('keyvaluepairs')

    const getRequest = store.get('persist:localWalletSlice')
    getRequest.onerror = event => {
      console.error('Error fetching data:', event.target.error)
    }

    getRequest.onsuccess = () => {
      let walletSlice = getRequest.result
      console.log('Fetched walletSlice:', walletSlice)

      if (walletSlice) {
        if (typeof walletSlice === 'string') {
          walletSlice = JSON.parse(walletSlice)
          console.log('Parsed walletSlice:', walletSlice)
        }
      } else {
        walletSlice = {}
      }

      const savedWalletId = walletSlice.walletDeviceId
      const localWalletDeviceId = KK_DEVICE_ID

      if (
        !walletSlice ||
        walletSlice.walletType === 'null' ||
        walletSlice.walletType === 'keepkey'
      ) {
        if (!savedWalletId || savedWalletId !== localWalletDeviceId) {
          // Add additional quotes to walletType and walletDeviceId
          walletSlice.walletType = `"keepkey"`
          walletSlice.walletDeviceId = `"${localWalletDeviceId}"`

          const updatedWalletSlice = JSON.stringify(walletSlice)
          console.log('Updated walletSlice:', updatedWalletSlice)

          store.put(updatedWalletSlice, 'persist:localWalletSlice')
        }
      }
    }
  }

  openRequest.onerror = event => {
    console.error('Error opening database:', event.target.errorCode)
  }
}, 500)

localStorage.setItem('@app/serviceKey', KK_SDK_API_KEY)
localStorage.setItem('localWalletType', 'keepkey')
localStorage.setItem('localWalletDeviceId', KK_DEVICE_ID)

window.ethereum = undefined
