const ms = require('ms')
const InMemoryStorage = require('./InMemoryStorage')

function createCache({ cleanupInterval = '5 mins', customStorage } = {}) {
  let cache = customStorage || new InMemoryStorage()
  let intervalTickId

  const isUndef = v => typeof v === 'undefined'
  const isDef = v => typeof v !== 'undefined'
  const isFn = v => typeof v === 'function'
  const isNum = v => typeof v === 'number'

  const checkHasExpired = exp => exp && new Date(exp).getTime() < Date.now()

  async function set(key, value, expiresIn) {
    if (expiresIn) {
      const expiredInMs = isNum(expiresIn) ? expiresIn : ms(expiresIn)
      await cache.set(key, [value, new Date(Date.now() + expiredInMs).toISOString()])
      return value
    }

    await cache.set(key, [value])
    return value
  }

  async function resolve(key, value, expiresIn) {
    const storedValue = await cache.get(key)

    if (isUndef(storedValue)) {
      if (isDef(value)) {
        // A first time set (nothing in store but value defined).
        const newValue = isFn(value) ? await value() : value
        set(key, newValue, expiresIn)
        return newValue
      }

      // A get request with nothing in the store.
      return undefined
    }

    const [cachedValue, cachedExpiresIn] = storedValue
    const hasExpired = checkHasExpired(cachedExpiresIn)

    if (hasExpired) {
      // If the stored value has expired and a value was provided then save it to store
      // and return that.
      if (isDef(value)) {
        const newValue = isFn(value) ? await value() : value
        set(key, newValue, expiresIn)
        return newValue
      }

      // If the stored value has expired and no value was provided then return undefined and
      // remove it from storage.
      cache.del(key)
      return undefined
    }

    // If the value hasn't expired then return it.
    return cachedValue
  }

  async function del(key, matchStart) {
    if (matchStart) {
      const keys = await cache.keys()
      keys.forEach(cacheKey => {
        if (cacheKey.indexOf(key) === 0) {
          cache.del(cacheKey)
        }
      })
      return
    }

    cache.del(key)
  }

  function clear() {
    return cache.clear()
  }

  function teardown() {
    clearInterval(intervalTickId)
  }

  if (cleanupInterval) {
    intervalTickId = setInterval(async () => {
      const keys = await cache.keys()
      keys.forEach(async k => {
        const value = await cache.get(k)
        if (value) {
          const expiresIn = value[1]
          const hasExpired = checkHasExpired(expiresIn)
          if (hasExpired) {
            cache.del(k)
          }
        }
      })
    }, ms(cleanupInterval))
  }

  return {
    resolve,
    del,
    clear,
    teardown,
  }
}

module.exports = createCache
