import * as Comlink from 'comlink'

Comlink.transferHandlers.set('AbortSignal', {
  canHandle: (x: unknown): x is AbortSignal => x instanceof AbortSignal,
  serialize(signal: AbortSignal) {
    const { port1, port2 } = new MessageChannel()
    signal.addEventListener('abort', () => port1.postMessage({ reason: signal.reason }))
    return [port2, [port2]]
  },
  deserialize(signalPort: MessagePort): AbortSignal {
    const abortController = new AbortController()
    signalPort.addEventListener('message', (e: MessageEvent<{ reason: unknown }>) =>
      abortController.abort(e.data.reason),
    )
    signalPort.start()

    return abortController.signal
  },
} satisfies Comlink.TransferHandler<AbortSignal, MessagePort>)
