const ms = require('ms');
const InMemoryStorage = require('./InMemoryStorage');

function createCache({ cleanupInterval = '5 mins', customStorage } = {}) {
  let cache = customStorage || new InMemoryStorage();
  let intervalTickId;

  const isUndef = v => typeof v === 'undefined';
  const isDef = v => typeof v !== 'undefined';
  const isFn = v => typeof v === 'function';
  const isNum = v => typeof v === 'number';

  const checkExpired = exp => exp && new Date(exp) < Date.now();

  function set(key, value, expiresIn) {
    if (expiresIn) {
      const expiredInMs = isNum(expiresIn) ? expiresIn : ms(expiresIn);
      cache.set(key, [value, new Date(Date.now() + expiredInMs).toISOString()]);
      return value;
    }

    cache.set(key, [value]);
    return value;
  }

  async function resolve(key, value, expiresIn) {
    if (isUndef(cache.get(key))) {
      if (isDef(value)) {
        const newValue = isFn(value) ? await value() : value;
        return set(key, newValue, expiresIn);
      }

      return undefined;
    }

    const [cachedValue, cachedExpiresIn] = cache.get(key);
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

  function del(key, matchStart) {
    if (matchStart) {
      cache.keys().forEach(cacheKey => {
        if (cacheKey.indexOf(key) === 0) {
          cache.del(cacheKey);
        }
      });
      return;
    }

    cache.del(key);
  }

  function clear() {
    cache.clear();
  }

  function teardown() {
    clearInterval(intervalTickId);
  }

  if (cleanupInterval) {
    intervalTickId = setInterval(() => {
      cache.keys().forEach(async k => {
        const expiresIn = cache[k][1];
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
