class Database {
    constructor() {
        this.data = new Map();
    }

    set(key, value) {
        this.data.set(key, value);
        return "OK";
    }

    get(key) {
        return this.data.get(key);
    }

    del(key) {
        return this.data.delete(key) ? 1 : 0;
    }

    exists(key) {
        return this.data.has(key) ? 1 : 0;
    }
}

module.exports = Database;