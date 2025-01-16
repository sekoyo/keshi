# 3.0.0

This is a simplification and re-write.

- BREAKING: Only store promises and `.resolve()` always returns a promise.
- BREAKING: `getValue` is alwaus required as the 2nd arg to `.resolve()` and always a function.
- BREAKING: The default import is a class and should be instantiated as `new Keshi()` instead of `createCache`.
- BREAKING: Rename `del` to `delete` to be more clear and aligned with a ES6 Map.

This is more ergonomic for Promise based caches which is the main goal of this library. Though you can still cache plain values (you just have to await them).

Since the cache is no longer serializable and can only be in-memory, there's no option to pass a custom cache.

You can freely use v2 if you disagree with the decision/don't want to update your code.

# 2.0.7

- Make `createCache` options in TS def optional.

# 2.0.6

- Make types more specific for what type of value is passed to `get` and `set` (an array). Technically this is a breaking change for TS users as it requires TS v4 for named tuples.
- Fix cleanup interval if the `get` method of the storage returns a Promise.

# 2.0.5

- Add Typescript defs. Fix second example in the Readme; `fetchProjectMeta` should have been returning a function 🤦‍♂️

# 2.0.4

- Ignore this release, no useful changes ;)

# 2.0.3

- Fix potential crash in cleanup interval logic.

# 2.0.0

- Allow custom cache implementation.
- Change expiresIn to be a `Date` or a function which returns a `Date`. This is stored in the cache as a `String` to make serialization for custom caches simpler.
- Moved `stopCleanupTask` functionality to `teardown`.
