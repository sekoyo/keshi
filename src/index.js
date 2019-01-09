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

  const set = (key, value, expiresIn) => {
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
  };

  const resolve = async (key, value, expiresIn) => {
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
  };

  const del = key => delete cache[key];

  const clear = () => {
    cache = {};
  };

  const stopCleanupTask = () => clearInterval(intervalTickId);

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