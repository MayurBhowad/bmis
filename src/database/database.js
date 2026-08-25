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
}

module.exports = Database;