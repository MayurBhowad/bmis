import Storage from './storage';

class Database {
    storage: Storage;

    constructor(storage: Storage = new Storage()) {
        this.storage = storage;
    }

    ttl(key: string): number {
        if(!this.storage.has(key)) {
            return -2;
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return -2;
        }
        const expiredAt = this.storage.getExpiration(key);
        if(expiredAt === undefined) {
            return -1;
        }
        const remainingMilliseconds = expiredAt - Date.now();
        return Math.ceil(remainingMilliseconds / 1000);
    }

    set(key: string, value: string | string[], _type?: string): string {
        this.storage.set(key, { value, type: 'string' });
        this.storage.deleteExpiration(key);
        return "OK";
    }

    get(key: string): string | string[] | null {
        if (!this.storage.has(key)) {
            return null;
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return null;
        }
        return this.storage.get(key)!.value;
    }

    del(key: string): number {
        if(!this.storage.has(key)) {
            return 0;
        }
        this.deleteKey(key);
        return 1;
    }

    exists(key: string): number {
        return this.storage.has(key) ? 1 : 0;
    }

    expireAt(key: string, timestamp: number): number {
        if(!this.storage.has(key)) {
            return 0;
        }

        this.storage.setExpiration(key, timestamp);
        return 1;
    }

    isExpired(key: string): boolean {
        const expiredAt = this.storage.getExpiration(key);
        if(expiredAt === undefined) {
            return false;
        }

        return Date.now() >= expiredAt;
    }

    deleteKey(key: string): void {
        this.storage.delete(key);
        this.storage.deleteExpiration(key);
    }

    type(key: string): string {
        if(!this.storage.has(key)) {
            return 'none';
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return 'none';
        }
        return this.storage.get(key)!.type;
    }
}

export default Database;
