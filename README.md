# Keshi

[![Keshi on NPM](https://img.shields.io/npm/v/keshi.svg)](https://www.npmjs.com/package/keshi)
[![Keshi on TravisCI](https://travis-ci.org/DominicTobias/keshi.svg?branch=master)](https://travis-ci.org/DominicTobias/keshi)

Keshi is a better in-memory (or custom) cache for Node and the browser.

```js
const createCache = require('keshi');
```

or

```js
import createCache from 'keshi';
```

<h2>Usage</h2>

```js
const cache = createCache();

const user = await cache.resolve('user', () => fetch('https://myapi.com/user').then(r => json()), '30 mins');
```

What this will do:

- Fetch the user from the API as it doesn't have it in cache.
- If called again within 30 minutes it will return the cached user.
- If called after 30 minutes it will fetch the user again and re-cache.

<h3>Cache the data you need</h3>

You should return only the data you need to keep the cache efficient. Here's a real world example of caching repository information from GitHub:

```js
// In the browser
const fetchProjectMeta = (user, repo) =>
  fetch(`https://api.github.com/repos/${user}/${repo}`)
    .then(r => r.json())
    .then(r => ({ name: r.full_name, description: r.description }));

// ...or in Node
const fetchProjectMeta = (user, repo) =>
  got
    .get(`https://api.github.com/repos/${user}/${repo}`, { json: true })
    .then(r => ({ name: r.body.full_name, description: r.body.description }));

// And call it (for 1 hour it will return cached results).
const meta = await cache.resolve('myRepo', fetchProjectMeta('DominicTobias', 'keshi'), '1 hour');
```

Rate limited APIs (as above), saving bandwidth, dealing with poor client network speeds, returning server responses faster are some of the reasons you might consider caching requests.

Keshi will automatically keep memory low by cleaning up expired items.

<h2>API</h2>

<h4>resolve(key, [value], [expiresIn])</h4>

`key` &rarr; String &rarr; _Required_

`value` &rarr; Any &rarr; _Optional_

A function which resolves to a value, or simply a literal value.

`expiresIn` &rarr; Number | String | Function &rarr; _Optional_

A number in milliseconds or anything that [ms](https://www.npmjs.com/package/ms) accepts after which the value is considered expired. If no expiry is provided the item will never expire.

<h4>del(key, matchStart)</h4>

Delete a cached item by key.

You can also delete any that start with the key by passing `true` to matchStart.

```
cache.del('project.5c4a351f8f49cf1097394204.', true)
```

<h4>clear()</h4>

Clear all cached items.

<h2>Custom storage</h2>

The default cache is in-memory, however the storage can be anything you like. To pass in a custom storage:

```js
const cache = createCache({ customStorage });
```

Your cache must implement the following methods:

<h4>customStorage.get(key)</h4>

Returns the cache value given the key. Cache values must be returned as an `Array` of `[value, <expiresIn>]`. `expiresIn` be an ISO Date string.

<h4>customStorage.set(key, value)</h4>

Values set are of type `Array` in the following format: `[value, <expiresIn>]`. `expiresIn` should be an ISO Date string.

<h4>customStorage.del(key)</h4>

Removes the item specified by key from the cache.

<h4>customStorage.keys()</h4>

Returns an array of cache keys.

<h4>customStorage.clear()</h4>

Clears all items from the cache.
