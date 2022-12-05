/**
 * This function unconditionally narrows the type of its parameter, allowing for more
 * ergonomic type assertions.
 */
export function assume<T>(_: unknown): asserts _ is T {}

/**
 * This function does exhaustiveness checking to ensure that you have discriminated a
 * union so that no type remains. Use this to get the typescript compiler to help
 * discover cases that were not considered.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`)
}

export function need<T>(value: T): NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error('expected a value')
  }
  return value
}

/**
 * Returns a copyable object which satisfies any type constraint but produces a runtime error if
 * accessed in any other way. Useful as dummy data for required parameters. (Probably a bad idea
 * in production.)
 */
export function untouchable(message?: string): any {
  const out = new Proxy(
    {},
    new Proxy(
      {},
      {
        get(_, p) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          return (_: any, p2: any) => {
            if (p === 'get' && p2 === 'valueOf') return () => out
            throw new Error(`${String(p)}(${String(p2)}): ${message ?? 'untouchable'}`)
          }
        },
      },
    ),
  ) as any
  return out
}

/**
 * Occasionally, especially when dealing with React-style state managment which doesn't integrate well
 * with async functions, it can be useful to store a Promise along with its associated resolution
 * handlers. This is not ideal, but can be the least evil way to solve certain problems.
 */
export type Deferred<T> = Promise<T> & {
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

export function deferred<T = void>(): Deferred<T> {
  let resolver: (value: T | PromiseLike<T>) => void
  let rejector: (reason?: unknown) => void

  const out = new Promise<T>((resolve, reject) => {
    resolver = resolve
    rejector = reject
  }) as Deferred<T>

  out.resolve = resolver!
  out.reject = rejector!

  return out
}
