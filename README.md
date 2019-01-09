# Keshi

Keshi is a better in-memory cache for Node or the browser.

```js
const createCache = require('keshi')
```

or

```js
import createCache from 'keshi'
```

<h2>Usage</h2>

[Sandbox Demo](https://codesandbox.io/s/pm1xojlk1x)

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

`key` &rarr; String &rarr; *Required*

`value` &rarr; Any &rarr; *Optional*

A function which resolves to a value, or simply a literal value.

`expiresIn` &rarr; Number | String | Function &rarr; *Optional*

A number in milliseconds or anything that [ms](https://www.npmjs.com/package/ms) accepts after which the value is considered expired. If no expiry is provided the item will never expire.

Can also be a function (async is allowed) which returns true if the item has expired or otherwise false. e.g.

```
// Expire 50% of the time.
const date = await cache.resolve('date', () => new Date(), () => Math.random() >= 0.5)
```

<h4>del(key)</h4>

Delete a cached item by key.

<h4>clear()</h4>

Clear all cached items.
