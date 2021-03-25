# Keshi

[![Keshi on NPM](https://img.shields.io/npm/v/keshi.svg)](https://www.npmjs.com/package/keshi)
[![Keshi on TravisCI](https://travis-ci.org/DominicTobias/keshi.svg?branch=master)](https://travis-ci.org/DominicTobias/keshi)

Keshi is a better in-memory (or custom) cache for Node and the browser.

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

const user = await cache.resolve('user', () => fetch('https://myapi.com/user').then(r => r.json()), '30 mins')
```

What this will do:

- Fetch the user from the API as it doesn't have it in cache.
- If called again within 30 minutes it will return the cached user.
- If called after 30 minutes it will fetch the user again and re-cache.

<h3>Cache the data you need</h3>

You should return only the data you need to keep the cache efficient. Here's a real world example of caching repository information from GitHub:

```js
const cache = createCache()

// In the browser
const fetchProjectMeta = (user, repo) => () =>
  fetch(`https://api.github.com/repos/${user}/${repo}`)
    .then(r => r.json())
    .then(r => ({ name: r.full_name, description: r.description }))

// ...or in Node
const fetchProjectMeta = (user, repo) => () =>
  got
    .get(`https://api.github.com/repos/${user}/${repo}`, { json: true })
    .then(r => ({ name: r.body.full_name, description: r.body.description }))

// And call it (for 1 hour it will return cached results).
const meta = await cache.resolve('myRepo', fetchProjectMeta('DominicTobias', 'keshi'), '1 hour')
```

Rate limited APIs (as above), saving bandwidth, dealing with poor client network speeds, returning server responses faster are some of the reasons you might consider caching requests.

Keshi will automatically keep memory low by cleaning up expired items.

<h2>API</h2>

#### `cache.resolve(key, [value], [expiresIn])`

**key: IDBValidKey**

A unique key to get and set the value from the store.

**value?: T | (() => T | Promise<T>)**

<ol type="a">
  <li>A simple value to set to the store in the case of no expiry (one time set).</li>
  <li>A function that returns a value or a Promise to a value.</li>
</ol>

**expiresIn?: number | string**

A number in milliseconds or anything that [ms](https://www.npmjs.com/package/ms) accepts after which the value is considered expired. If not provided then the value will be set once and has no expiry.

#### `cache.del(key, [matchStart])`

**key: IDBValidKey**

A unique key to delete the cache for OR the start of such a key (possibly matching many).

**matchStart?: boolean**

You can also delete any that start with the key by passing `true` to matchStart.

```js
cache.del(`project.${projectId}.`, true)
```

#### `cache.clear()`

Clear the whole cache.

#### `cache.teardown()`

A stale cache cleanup interval is running in the background unless you set `createCache({ cleanupInterval: 0 })`. If your cache doesn't last the lifetime of your application then you should call teardown.

<h2>Custom storage</h2>

The default cache is in-memory, however the storage can be anything you like. To pass in a custom storage:

```js
const customStorage = new MyCustomStorage()
const cache = createCache({ customStorage })
```

Your cache must implement the following methods:

<h3>customStorage.get(key)</h3>

Returns the cache value given the key. Cache values must be returned as an `Array` of `[value, <expiresIn>]`. `expiresIn` is an ISO Date string.

This method can be async.

<h3>customStorage.set(key, value)</h3>

Values set are of type `Array` in the following format: `[value, <expiresIn>]`. `expiresIn` should be an ISO Date string.

This method can be async.

<h3>customStorage.del(key)</h3>

Removes the item specified by key from the cache.

This method can be async.

<h3>customStorage.keys()</h3>

Returns an array of cache keys.

This method can be async.

<h3>customStorage.clear()</h3>

Clears all items from the cache.

The `clear` method of the public interface will return the results of this call. You could for example return a Promise that your app can wait on before performing subsequent actions.

<h3>Example</h3>

```js
import { get, set, keys, del, clear } from 'idb-keyval'

const customStorage = { get, set, keys, del, clear }
const cache = createCache({ customStorage })
```
