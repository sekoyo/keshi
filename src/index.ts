import ms from 'ms'

type ValueTuple = [value: Promise<unknown>, expiresAt: number]

const NO_EXPIRY = -1

export default class Keshi {
  private cache: Map<string, ValueTuple> = new Map()
  private cleanupTimer?: ReturnType<typeof setTimeout>
  cleanupInterval = ms('2m')

  private cleanupTask = () => {
    const now = Date.now()
    for (const [key, [, expiresAt]] of this.cache) {
      if (expiresAt !== NO_EXPIRY && now > expiresAt) {
        this.cache.delete(key)
      }
    }
    this.cleanupTimer = setTimeout(this.cleanupTask, this.cleanupInterval)
  }

  constructor() {
    this.cleanupTimer = setTimeout(this.cleanupTask, this.cleanupInterval)
  }

  resolve<T>(
    key: string,
    getValue: () => T | Promise<T>,
    expiresIn: number | string = NO_EXPIRY
  ): Promise<T> {
    const now = Date.now()
    const existing = this.cache.get(key)

    if (existing) {
      const [cachedValue, expiresAt] = existing

      // Check if still valid
      if (expiresAt === NO_EXPIRY || now <= expiresAt) {
        // Return the cached value as a promise (in case it was sync)
        return Promise.resolve(cachedValue) as Promise<T>
      } else {
        // Expired, delete from cache
        this.cache.delete(key)
      }
    }

    // Not in cache or was expired -> fetch new
    let newExpiresAt = NO_EXPIRY
    if (expiresIn !== NO_EXPIRY) {
      const duration = typeof expiresIn === 'number' ? expiresIn : ms(expiresIn)
      newExpiresAt = now + duration
    }

    // Call getValue; could be sync or async
    const result = getValue()

    // If result is not a promise, convert to promise so we always store a promise
    const promiseResult = Promise.resolve(result).then(val => val)

    // Store the promise (or final value) in the cache
    this.cache.set(key, [promiseResult, newExpiresAt])

    return promiseResult
  }

  delete(key: string, matchStart: boolean): void {
    if (!matchStart) {
      // Delete only this exact key
      this.cache.delete(key)
      return
    }

    // If matchStart is true, delete all keys that begin with `key`
    for (const k of this.cache.keys()) {
      if (k.startsWith(key)) {
        this.cache.delete(k)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  teardown() {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
    }
  }
}
