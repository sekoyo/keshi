# Keshi

Keshi is a better in-memory cache.

```js
const createCache = require('keshi')
```

or

```js
import createCache from 'keshi'
```

<h2>Usage</h2>

```js
const cache = createCache()

const res = await cache.resolve('user', () => fetch('https://myapi.com/user'), '30 mins')
```

What this will do:

- Fetch the user from the API as it doesn't have it in cache.
- If called again within 30 minutes it will return the cached user.
- If called after 30 minutes it will fetch the user again and re-cache.

<h2>API</h2>

<h4>resolve(key, [value], [expiresIn])</h4>

`key` | String | *Required*

`value` | Mixed | *Optional*
A function which resolves to a value, or simply a literal value.

`expiresIn` | Number or String | *Optional*
A number in milliseconds or anything that [ms](https://www.npmjs.com/package/ms) accepts after which the value is considered expired. If no expiry is provided the item will never expire.

<h4>del(key)</h4>

Delete a cached item by key.

<h4>clear()</h4>

Clear all cached items.
