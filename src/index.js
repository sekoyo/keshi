const ms = require('ms');
const InMemoryStorage = require('./InMemoryStorage');

function createCache({ cleanupInterval = '5 mins', customStorage } = {}) {
  let cache = customStorage || new InMemoryStorage();
  let intervalTickId;

  const isUndef = (v) => typeof v === 'undefined';
  const isDef = (v) => typeof v !== 'undefined';
  const isFn = (v) => typeof v === 'function';
  const isNum = (v) => typeof v === 'number';

  const checkExpired = (exp) => exp && new Date(exp) < Date.now();

  async function set(key, value, expiresIn) {
    if (expiresIn) {
      const expiredInMs = isNum(expiresIn) ? expiresIn : ms(expiresIn);
      await cache.set(key, [value, new Date(Date.now() + expiredInMs).toISOString()]);
      return value;
    }

    await cache.set(key, [value]);
    return value;
  }

  async function resolve(key, value, expiresIn) {
    const resolvedValue = await cache.get(key);
    if (isUndef(resolvedValue)) {
      if (isDef(value)) {
        const newValue = isFn(value) ? await value() : value;
        return set(key, newValue, expiresIn);
      }

      return undefined;
    }

    const [cachedValue, cachedExpiresIn] = resolvedValue;
    const hasExpired = await checkExpired(cachedExpiresIn);

    if (hasExpired) {
      if (isDef(value)) {
        const newValue = isFn(value) ? await value() : value;
        return set(key, newValue, expiresIn);
      }

      cache.del(key);
      return undefined;
    }

    return cachedValue;
  }

  async function del(key, matchStart) {
    if (matchStart) {
      const keys = await cache.keys();
      keys.forEach((cacheKey) => {
        if (cacheKey.indexOf(key) === 0) {
          cache.del(cacheKey);
        }
      });
      return;
    }

    cache.del(key);
  }

  function clear() {
    return cache.clear();
  }

  function teardown() {
    clearInterval(intervalTickId);
  }

  if (cleanupInterval) {
    intervalTickId = setInterval(async () => {
      const keys = await cache.keys();
      keys.forEach(async (k) => {
        const expiresIn = cache.get(k)[1];
        const hasExpired = await checkExpired(expiresIn);
        if (hasExpired) {
          cache.del(k);
        }
      });
    }, ms(cleanupInterval));
  }

  return {
    resolve,
    del,
    clear,
    teardown,
  };
}

module.exports = createCache;
