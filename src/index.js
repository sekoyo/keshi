const ms = require('ms');

function createCache(cleanupInterval = '5 mins') {
  let cache = {};

  const set = (key, value, expiresIn) => {
    if (expiresIn) {
      const expiredInMs = typeof expiresIn === 'number' ? expiresIn : ms(expiresIn);
      cache[key] = [value, Date.now() + expiredInMs];
    } else {
      cache[key] = [value];
    }

    return value;
  };

  const resolve = async (key, value, expiresIn) => {
    if (typeof cache[key] === 'undefined') {
      if (typeof value !== 'undefined') {
        const newValue = typeof value === 'function' ? await value() : value;
        return set(key, newValue, expiresIn);
      }

      return undefined;
    }

    const [cachedValue, expiresAt] = cache[key];

    if (expiresAt && expiresAt < Date.now()) {
      if (typeof value !== 'undefined') {
        const newValue = typeof value === 'function' ? await value() : value;
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

  if (cleanupInterval) {
    setInterval(() => {
      Object.keys(cache).forEach((k) => {
        const expiresAt = cache[k][1];
        if (expiresAt && expiresAt < Date.now()) {
          delete cache[k];
        }
      });
    }, ms(cleanupInterval));
  }

  return { resolve, del, clear };
}

const cache = createCache();
cache.resolve('hello', 'world', '2 mins');

module.exports = createCache;