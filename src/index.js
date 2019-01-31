const ms = require('ms');

function createCache(cleanupInterval = '5 mins') {
  let cache = {};
  let intervalTickId;

  const isUndef = v => typeof v === 'undefined';
  const isDef = v => typeof v !== 'undefined';
  const isFn = v => typeof v === 'function';
  const isNum = v => typeof v === 'number';

  const checkExpired = async exp => exp && (
    (isFn(exp) && await exp()) || exp < Date.now()
  );

  function set(key, value, expiresIn) {
    if (expiresIn) {
      if (isFn(expiresIn)) {
        cache[key] = [value, expiresIn];
        return value;
      }

      const expiredInMs = isNum(expiresIn) ? expiresIn : ms(expiresIn);
      cache[key] = [value, Date.now() + expiredInMs];
      return value;
    }

    cache[key] = [value];
    return value;
  }

  async function resolve(key, value, expiresIn) {
    if (isUndef(cache[key])) {
      if (isDef(value)) {
        const newValue = isFn(value) ? await value() : value;
        return set(key, newValue, expiresIn);
      }

      return undefined;
    }

    const [cachedValue, cachedExpiresIn] = cache[key];
    const hasExpired = await checkExpired(cachedExpiresIn);

    if (hasExpired) {
      if (isDef(value)) {
        const newValue = isFn(value) ? await value() : value;
        return set(key, newValue, expiresIn);
      }

      delete cache[key];
      return undefined;
    }

    return cachedValue;
  }

  function del(key, wildcardSearch) {
    if (wildcardSearch && key[key.length - 1] === '*') {
      const searchStr = key.slice(0, -1);
      Object.keys(cache).forEach((cacheKey) => {
        if (cacheKey.indexOf(searchStr) === 0) {
          delete cache[cacheKey];
        }
      });
      return;
    }

    delete cache[key];
  }

  function clear() {
    cache = {};
  }

  function stopCleanupTask() {
    clearInterval(intervalTickId);
  }

  if (cleanupInterval) {
    intervalTickId = setInterval(() => {
      Object.keys(cache).forEach(async (k) => {
        const expiresIn = cache[k][1];
        const hasExpired = await checkExpired(expiresIn);
        if (hasExpired) {
          delete cache[k];
        }
      });
    }, ms(cleanupInterval));
  }

  return {
    stopCleanupTask,
    resolve,
    del,
    clear,
  };
}

module.exports = createCache;