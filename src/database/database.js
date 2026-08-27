class Database {
    constructor() {
        this.data = new Map();
        this.expires = new Map();
    }

    set(key, value) {
        this.data.set(key, value);
        this.expires.delete(key);
        return "OK";
    }

    get(key) {
        if (!this.data.has(key)) {
            return null;
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return null;
        }
        return this.data.get(key);
    }

    del(key) {
        if(!this.data.has(key)) {
            return 0;
        }
        this.deleteKey(key);
        return 1;
    }

    exists(key) {
        return this.data.has(key) ? 1 : 0;
    }

    expireAt(key, timestamp) {
        if(!this.data.has(key)) {
            return 0;
        }

        this.expires.set(key, timestamp);
        return 1;
    }

    isExpired(key) {
        const expiredAt = this.expires.get(key);
        if(expiredAt === undefined) {
            return false;
        }

        return Date.now() >= expiredAt;
    }

    deleteKey(key) {
        this.data.delete(key);
        this.expires.delete(key);
    }
}

module.exports = Database;