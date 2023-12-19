// Initialized in browser_injection.js
// const KK_SDK_API_KEY = 'API_KEY_HERE'
const KK_DEVICE_ID = 'WALLET_DEVICE_ID_HERE'

console.log('LOADED SS AUTOLOGIN SCRIPT')

const openRequest = indexedDB.open('localforage', 2)

openRequest.onupgradeneeded = event => {
  const db = event.target.result
  if (!db.objectStoreNames.contains('keyvaluepairs')) {
    db.createObjectStore('keyvaluepairs')
  }
}

openRequest.onsuccess = event => {
  const db = event.target.result
  const transaction = db.transaction(['keyvaluepairs'], 'readwrite')
  const store = transaction.objectStore('keyvaluepairs')

  const getRequest = store.get('persist:root')
  getRequest.onerror = event => {
    console.error('Error fetching data:', event.target.error)
  }

  getRequest.onsuccess = () => {
    let data = getRequest.result
    let walletSlice = {}

    if (data) {
      if (typeof data === 'string') {
        data = JSON.parse(data)
      }
      if (data.localWalletSlice && typeof data.localWalletSlice === 'string') {
        walletSlice = JSON.parse(data.localWalletSlice)
      }
    } else {
      data = {}
    }

    walletSlice.walletType = 'keepkey'
    walletSlice.walletDeviceId = KK_DEVICE_ID

    data.localWalletSlice = JSON.stringify(walletSlice)
    const updatedData = JSON.stringify(data)

    store.put(updatedData, 'persist:root').onsuccess = () => {
      console.log('IndexedDB updated with persist:root')
    }
  }
}

openRequest.onerror = event => {
  console.error('Error opening database:', event.target.errorCode)
}
localStorage.setItem('@app/serviceKey', KK_SDK_API_KEY)
localStorage.setItem('localWalletType', 'keepkey')
localStorage.setItem('localWalletDeviceId', KK_DEVICE_ID)
localStorage.setItem('@app/ssautologin', true)
