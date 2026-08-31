class Storage {
    constructor() {
        this.data = new Map();
        this.expire = new Map();
    }

    set(key, value) {
        this.data.set(key, value);
    }

    get(key) {
        return this.data.get(key);
    }

    has(key) {
        return this.data.has(key);
    }

    delete(key) {
        return this.data.delete(key);
    }

    getExpiration(key) {
        return this.expire.get(key);
    }

    setExpiration(key, expiration) {
        this.expire.set(key, expiration);
    }

    deleteExpiration(key) {
        return this.expire.delete(key);
    }
    
    
}

module.exports = Storage;