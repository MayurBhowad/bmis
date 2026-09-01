const Storage = require('./storage');

class Database {
    constructor(storage = new Storage()) {
        this.storage = storage;
    }

    ttl(key) {
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

    set(key, value) {
        this.storage.set(key, { value, type: 'string' });
        this.storage.deleteExpiration(key);
        return "OK";
    }

    get(key) {
        if (!this.storage.has(key)) {
            return null;
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return null;
        }
        return this.storage.get(key).value;
    }

    del(key) {
        if(!this.storage.has(key)) {
            return 0;
        }
        this.deleteKey(key);
        return 1;
    }

    exists(key) {
        return this.storage.has(key) ? 1 : 0;
    }

    expireAt(key, timestamp) {
        if(!this.storage.has(key)) {
            return 0;
        }

        this.storage.setExpiration(key, timestamp);
        return 1;
    }

    isExpired(key) {
        const expiredAt = this.storage.getExpiration(key);
        if(expiredAt === undefined) {
            return false;
        }

        return Date.now() >= expiredAt;
    }

    deleteKey(key) {
        this.storage.delete(key);
        this.storage.deleteExpiration(key);
    }

    type(key) {
        if(!this.storage.has(key)) {
            return 'none';
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return 'none';
        }
        return this.storage.get(key).type;
    }
}

module.exports = Database;