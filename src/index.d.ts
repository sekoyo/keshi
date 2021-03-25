export interface Storage {
  get<T = any>(key: IDBValidKey): T | undefined | Promise<T | undefined>;
  set<T = any>(key: IDBValidKey, value: T): void;
  keys(): IDBValidKey[] | Promise<IDBValidKey[]>;
  del(key: IDBValidKey): void;
  clear(): void;
}

export interface Options {
  cleanupInterval?: string | number;
  customStorage?: Storage;
}

export interface Cache {
  resolve<T = any>(
    key: IDBValidKey,
    value: T | (() => Promise<T>),
    expiresIn: number | string
  ): T;
  del(key: IDBValidKey, matchStart: boolean): ReturnType<Storage["del"]>;
  clear(): ReturnType<Storage["clear"]>;
  teardown(): void;
}

declare const createCache: (options: Options) => Cache;

export default createCache;

