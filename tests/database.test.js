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

test("SET clears exisiting expiration", () => {
    const database = new Database();
    database.set('session', 'active');
    database.expireAt('session', Date.now() + 100000);

    database.set('session', 'renewed');

    assert.strictEqual(database.expires.has('session'), false);
});

test("TTL returns -2 for missing key", () => {
    const database = new Database();
    assert.strictEqual(database.ttl('missing'), -2);
});

test("TTL returns -1 for a key without expiration", () => {
    const database = new Database();
    database.set('name', 'Mayur');
    assert.strictEqual(database.ttl('name'), -1);
});

test("TTL returns the remaining seconds for an expiring key", () => {
    const database = new Database();
    database.set('session', 'active');
    database.expireAt('session', Date.now() + 10000);
    const ttl = database.ttl('session');

    assert.ok(ttl >= 0);
    assert.ok(ttl <= 10);
});