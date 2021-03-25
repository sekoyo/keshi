import { Storage } from './index'

export default class InMemoryStorage implements Storage {
    get<T = any>(key: IDBValidKey): T | undefined | Promise<T | undefined>;
    set<T = any>(key: IDBValidKey, value: T): void;
    keys(): IDBValidKey[] | Promise<IDBValidKey[]>;
    del(key: IDBValidKey): void;
    clear(): void;
};
