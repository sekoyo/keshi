# Keshi

[![Keshi on NPM](https://img.shields.io/npm/v/keshi.svg)](https://www.npmjs.com/package/keshi)
[![CI](https://github.com/sekoyo/keshi/actions/workflows/ci.yml/badge.svg)](https://github.com/sekoyo/keshi/actions/workflows/ci.yml)

Keshi is a tiny in-memory cache for Node and the browser that is especially suited to storing Promises (e.g. caching fetch requests).

```js
import Keshi from 'keshi'
// or
const Keshi = require('keshi')
```

<h2>Usage</h2>

```js
const cache = new Keshi()

const user = await cache.resolve(
  'user',
  () => fetch('https://myapi.com/user').then(r => r.json()),
  '5mins'
)
```

What this will do:

- Fetch the user from the API as it doesn't have it in cache.
- If called again within 30 minutes it will return the cached user.
- If called after 30 minutes it will fetch the user again and re-cache.

Keshi automatically cleans up expired items.

<h2>API</h2>

#### `cache.resolve<T>(key: string, getValue: () => T | Promise<T>, expiresIn?: number | string) => Promise<T>`

```ts
function getCachedUser() {
  return cache.resolve(
    'user',
    () => fetch('https://myapi.com/user').then(r => r.json()),
    '5mins' // Anything 'ms' package accepts or milliseconds as a number. Omit for no expiry.
  )
}

const user1 = await getCachedUser() // First time caches the promise and returns it
const user2 = await getCachedUser() // Second time returns the first promise if within 5mins
```

You can use plain values but they must still be awaited:

```ts
const plainValue = await cache.resolve('mynumber', () => 5, '10mins')
console.log(plainValue) // prints 5
```

#### `cache.delete(key: string, matchStart?: boolean)`

Explicitly delete a cached object.

Note: expired objects are automatically cleanup up.

If `true` is passed for `matchStart` then any cache _starting_ with the `key` will be deleted:

```js
cache.del(`project.${projectId}.`, true) // Delete all caches under this projectId
```

#### `cache.clear()`

Clear the whole cache.

#### `cache.teardown()`

A stale cache cleanup interval is running in the background. If your cache doesn't last the lifetime of your application then you should call teardown.
