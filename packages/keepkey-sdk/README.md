
# KeepKey SDK

REST api for intergrating with the KeepKey hardware wallet.

- [KeepKey Website](https://www.keepkey.com/)
- [SDK tutorial](https://medium.com/@highlander_35968/creating-a-dapp-for-the-keepkey-desktop-f61e506f5026)

REST (REpresentational State Transfer) is an architectural style used for designing distributed systems. It is based on a client-server model, where the client makes requests to the server and the server responds with a representation of the requested resource. REST is used to build public APIs that are easy to use and maintain.

Swagger is an open source software framework used to describe and document RESTful APIs. It provides a simple way for developers to describe the operations, parameters and responses of an API. Swagger also provides interactive documentation, client SDK generation, and testing tools.

More info:

REST: https://restfulapi.net/

Swagger: https://swagger.io/

# SDK init

```
export const setupKeepKeySDK = async () => {
    let serviceKey = window.localStorage.getItem('@app/serviceKey')
    let config: any = {
        apiKey: serviceKey,
        pairingInfo: {
            name: 'ShapeShift',
            imageUrl: 'https://assets.coincap.io/assets/icons/fox@2x.png',
            basePath: 'http://localhost:1646/spec/swagger.json',
            url: 'https://web-theta-one.vercel.app',
        },
    }
    let sdk = await KeepKeySdk.create(config)

    if (!serviceKey) {
        window.localStorage.setItem('@app/serviceKey', config.apiKey)
    }
    return sdk
}
```
# SDK usage

## API

get a bitcoin address

```
     let path =
        {
          symbol: 'BTC',
          address_n: [0x80000000 + 44, 0x80000000 + 1, 0x80000000 + 0],
          coin: 'Bitcoin',
          script_type: 'p2pkh',
          showDisplay: false
        }

      let addressBtc = await sdk.system.info.getPublicKey(path)
```

sign a BTC tx

```
      let hdwalletTxDescription = {
        coin: 'Bitcoin',
        inputs:inputsSelected,
        outputs:outputsFinal,
        version: 1,
        locktime: 0,
      }

      //signTx
      let signedTxTransfer = await sdk.utxo.utxoSignTransaction(hdwalletTxDescription)
```
