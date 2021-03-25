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
