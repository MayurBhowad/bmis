import test from 'node:test';
import assert from 'node:assert';

import Storage from '../src/database/storage';
import Database from '../src/database/database';

function createDatabase() {
    const storage = new Storage();
    return new Database(storage);
}

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

    assert.strictEqual(database.storage.getExpiration('session'), undefined);
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

test("SET stores a string type value", () => {
    const database = new Database();
    database.set('name', 'Mayur');
    const entry = database.storage.get('name');

    assert.deepStrictEqual(entry, { value: 'Mayur', type: 'string' });
});

test("database reports type of a key", () => {
    const database = new Database();
    database.set('name', 'Mayur');
    assert.strictEqual(database.type('name'), 'string');
});

test("database uses injected storage", () => {
    const storage = new Storage();
    const database = new Database(storage);

    database.set('name', 'Mayur');

    assert.strictEqual(database.storage, storage);
    assert.deepStrictEqual(storage.get('name'), { value: 'Mayur', type: 'string' });
});


test("SCAN returns keys using a cursor", () => {
    const database = createDatabase();

    database.set('key1', 'value1');
    database.set('key2', 'value2');
    database.set('key3', 'value3');

    const firstBatch = database.scan('0', 2);

    assert.ok(Array.isArray(firstBatch));
    assert.notStrictEqual(firstBatch[0], '0');
    assert.strictEqual(firstBatch.length, 3);

    const nextBatch = database.scan(firstBatch[0], 2);

    assert.ok(Array.isArray(nextBatch));
    assert.strictEqual(nextBatch[0], '0');

    const scannedKeys = [...firstBatch.slice(1), ...nextBatch.slice(1)];

    assert.deepStrictEqual(
        new Set(scannedKeys),
        new Set(['key1', 'key2', 'key3'])
    );
});

test("SCAN includes both string and list keys", () => {
    const database = createDatabase();

    database.set('string-key', 'value');
    database.storage.set('list-key', {
        value: ['one', 'two'],
        type: 'list'
    });

    const result = database.scan('0', 100);

    assert.ok(Array.isArray(result));
    assert.ok(result.includes('string-key'));
    assert.ok(result.includes('list-key'));
});

test("SCAN excludes and removes expired keys", () => {
    const database = createDatabase();

    database.set('active-key', 'active');
    database.set('expired-key', 'expired');

    database.expireAt('expired-key', Date.now() - 1000);

    const result = database.scan('0', 100);

    assert.ok(Array.isArray(result));
    assert.ok(result.includes('active-key'));
    assert.ok(!result.includes('expired-key'));
    assert.strictEqual(database.storage.has('expired-key'), false);
});

test("SCAN returns cursor 0 when storage is empty", () => {
    const database = createDatabase();

    assert.deepStrictEqual(database.scan('0', 10), ['0']);
});

test("SCAN rejects an invalid cursor", () => {
    const database = createDatabase();

    assert.strictEqual(
        database.scan('invalid-cursor', 10),
        'ERR invalid cursor'
    );
});

test("SCAN rejects invalid COUNT values", () => {
    const database = createDatabase();

    assert.strictEqual(database.scan('0', 0), 'ERR invalid scan count');
    assert.strictEqual(database.scan('0', -1), 'ERR invalid scan count');
    assert.strictEqual(database.scan('0', 101), 'ERR invalid scan count');
    assert.strictEqual(database.scan('0', 1.5), 'ERR invalid scan count');
});


test("SCAN does not examine more than COUNT entries", () => {
    const database = createDatabase();

    database.set('key1', 'value1');
    database.set('key2', 'value2');

    const firstBatch = database.scan('0', 2);

    assert.ok(Array.isArray(firstBatch));
    assert.notStrictEqual(firstBatch[0], '0');
    assert.strictEqual(firstBatch.length, 3);

    // The next call discovers that the iterator is exhausted.
    const secondBatch = database.scan(firstBatch[0], 2);

    assert.deepStrictEqual(secondBatch, ['0']);
});


test("SCAN can return an empty batch with a non-zero cursor", () => {
    const database = createDatabase();

    database.set('expired1', 'value1');
    database.set('active1', 'value2');

    database.expireAt('expired1', Date.now() - 1000);

    const firstBatch = database.scan('0', 1);

    assert.deepStrictEqual(firstBatch.slice(1), []);
    assert.notStrictEqual(firstBatch[0], '0');

    const secondBatch = database.scan(firstBatch[0], 1);

    assert.deepStrictEqual(secondBatch.slice(1), ['active1']);
    assert.notStrictEqual(secondBatch[0], '0');

    const thirdBatch = database.scan(secondBatch[0], 1);

    assert.deepStrictEqual(thirdBatch, ['0']);
});

test("SCAN rejects a cursor after its scan is completed", () => {
    const database = createDatabase();

    database.set('key1', 'value1');

    const firstBatch = database.scan('0', 10);

    assert.ok(Array.isArray(firstBatch));
    assert.deepStrictEqual(firstBatch, ['0', 'key1']);

    assert.strictEqual(
        database.scan('1', 10),
        'ERR invalid cursor'
    );
});


test("SCAN expires inactive cursors after 60 seconds", () => {
    const database = createDatabase();

    database.set('key1', 'value1');

    const originalNow = Date.now;
    let currentTime = 100_000;

    try {
        Date.now = () => currentTime;

        const firstBatch = database.scan('0', 1);

        assert.ok(Array.isArray(firstBatch));
        assert.notStrictEqual(firstBatch[0], '0');

        currentTime += 60_001;

        assert.strictEqual(
            database.scan(firstBatch[0], 1),
            'ERR invalid cursor'
        );
    } finally {
        Date.now = originalNow;
    }
});

test("SCAN limits active cursors to 1000", () => {
    const database = createDatabase();

    database.set('key1', 'value1');

    for (let index = 0; index < 1000; index++) {
        const result = database.scan('0', 1);

        assert.ok(Array.isArray(result));
        assert.notStrictEqual(result[0], '0');
    }

    assert.strictEqual(
        database.scan('0', 1),
        'ERR too many active scan cursors'
    );
});


test("SCAN skips keys deleted before they are visited", () => {
    const database = createDatabase();

    database.set('key1', 'value1');
    database.set('key2', 'value2');
    database.set('key3', 'value3');

    const firstBatch = database.scan('0', 1);

    assert.ok(Array.isArray(firstBatch));
    assert.deepStrictEqual(firstBatch.slice(1), ['key1']);

    database.del('key2');

    const secondBatch = database.scan(firstBatch[0], 10);

    assert.deepStrictEqual(secondBatch, ['0', 'key3']);
});

test("SCAN may visit keys inserted during an active scan", () => {
    const database = createDatabase();

    database.set('key1', 'value1');
    database.set('key2', 'value2');

    const firstBatch = database.scan('0', 1);

    assert.ok(Array.isArray(firstBatch));
    assert.deepStrictEqual(firstBatch.slice(1), ['key1']);

    database.set('key3', 'value3');

    const secondBatch = database.scan(firstBatch[0], 10);

    assert.deepStrictEqual(secondBatch, ['0', 'key2', 'key3']);
});
