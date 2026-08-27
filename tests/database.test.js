const test = require('node:test');
const assert = require('node:assert');

const Database = require('../src/database/database');

test("SET stores and GET retrieves a value", () => {
    const database = new Database();
    database.set('name', 'Mayur');
    assert.strictEqual(database.get('name'), 'Mayur');
});

test("GET retuns null for a missing key", () => {
    const database = new Database();
    assert.strictEqual(database.get('name'), null);
});

test("DEL removes an existing key", () => {
    const database = new Database();
    database.set('name', 'Mayur');

    assert.strictEqual(database.del('name'), 1);
    assert.strictEqual(database.get('name'), null);
});

test("DEL returns 0 for a missing key", () => {
    const database = new Database();
    assert.strictEqual(database.del('name'), 0);
});

test("EXISTS returns 1 for an existing key", () => {
    const database = new Database();
    database.set('name', 'Mayur');
    assert.strictEqual(database.exists('name'), 1);
});

test("EXISTS returns 0 for a missing key", () => {
    const database = new Database();
    assert.strictEqual(database.exists('name'), 0);
});

test("expired key return null", () => {
    const database = new Database();

    database.set('session', 'active');
    database.expireAt('session', Date.now() - 1000);

    assert.strictEqual(database.get('session'), null);
});