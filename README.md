# Keshi

[![Keshi on NPM](https://img.shields.io/npm/v/keshi.svg)](https://www.npmjs.com/package/keshi)
[![Keshi on TravisCI](https://travis-ci.org/DominicTobias/keshi.svg?branch=master)](https://travis-ci.org/DominicTobias/keshi)

Keshi is a better in-memory cache for Node and the browser.

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

const user = await cache.resolve('user', () => fetch('https://myapi.com/user'), '30 mins')
```

What this will do:

- Fetch the user from the API as it doesn't have it in cache.
- If called again within 30 minutes it will return the cached user.
- If called after 30 minutes it will fetch the user again and re-cache.

<h3>Cache the data you need</h3>

You should return only the data you need to keep the cache efficient. Here's a real world Node example of caching repository information from GitHub:

```js
const fetchProjectMeta = project => got.get(`https://api.github.com/repositories/${project.repo.id}`, {
  json: true,
  headers: {
    Authorization: `token ${project.accessToken}`,
  },
}).then(r => ({ name: r.body.name, fullName: r.body.full_name }));

async function resolveProjectMeta(project) {
  try {
    const meta = await cache.resolve(project.repo.id, fetchProjectMeta(project), '1 hour');
    return { ...project, ...meta };
  } catch (e) {
    console.error(e);
    return project;
  }
}
```

Among other things caches are ideal when dealing with rate limited external APIs (and saving bandwidth), without the of worries persistant data.

Keshi will automatically keep memory low by cleaning up expired items.

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
