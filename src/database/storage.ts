import { StorageEntry } from '../types';

class Storage {
    data: Map<string, StorageEntry>;
    expire: Map<string, number>;

    constructor() {
        this.data = new Map();
        this.expire = new Map();
    }

    set(key: string, value: StorageEntry): void {
        this.data.set(key, value);
    }

    get(key: string): StorageEntry | undefined {
        return this.data.get(key);
    }

    has(key: string): boolean {
        return this.data.has(key);
    }

    delete(key: string): boolean {
        return this.data.delete(key);
    }

    getExpiration(key: string): number | undefined {
        return this.expire.get(key);
    }

    setExpiration(key: string, expiration: number): void {
        this.expire.set(key, expiration);
    }

    deleteExpiration(key: string): boolean {
        return this.expire.delete(key);
    }
}

export default Storage;
