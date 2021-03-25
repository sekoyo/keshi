export interface Storage<K = IDBValidKey> {
  get<T = any>(
    key: K
  ): [theValue: T, expiredIn?: number] | undefined | Promise<[theValue: T, expiredIn?: number] | undefined>
  set<T = any>(key: K, value: [theValue: T, expiredIn?: number]): void
  keys(): K[] | Promise<K[]>
  del(key: K): void
  clear(): void
}

export type Duration = number | string

export interface Options {
  cleanupInterval?: Duration
  customStorage?: Storage
}

export interface Cache<K = IDBValidKey> {
  resolve<T = any>(key: K, value?: T | (() => T | Promise<T>), expiresIn?: Duration): T
  del(key: K, matchStart?: boolean): ReturnType<Storage['del']>
  clear(): ReturnType<Storage['clear']>
  teardown(): void
}

declare const createCache: (options: Options) => Cache

export default createCache
