# 2.0.3

- Fix potential crash in cleanup interval.

# 2.0.0

- Allow custom cache implementation.
- Change expiresIn to be a `Date` or a function which returns a `Date`. This is stored in the cache as a `String` to make serialization for custom caches simpler.
- Moved `stopCleanupTask` functionality to `teardown`.
