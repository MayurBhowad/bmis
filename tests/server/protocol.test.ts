import assert from 'node:assert/strict';
import test from 'node:test';

import Protocol from '../../src/server/protocol';

const protocol = new Protocol();


test("protocol encodes OK response", () => {
    assert.equal(protocol.encode('OK'), '+OK\r\n');
});

test("protocol encodes number response", () => {
    assert.equal(protocol.encode(10), ':10\r\n');
});

test('protocol encodes number response', () => {
    assert.equal(
        protocol.encode(10),
        ':10\r\n'
    );
});

test('protocol encodes null response', () => {
    assert.equal(
        protocol.encode(null),
        '$-1\r\n'
    );
});

test('protocol encodes array response', () => {
    assert.equal(
        protocol.encode(['apple', 'banana']),
        '*2\r\n$5\r\napple\r\n$6\r\nbanana\r\n'
    );
});

test('protocol encodes error response', () => {
    assert.equal(
        protocol.encode("ERR unknown command 'FOO'"),
        "-ERR unknown command 'FOO'\r\n"
    );
});

test('protocol encodes WRONGTYPE response', () => {
    assert.equal(
        protocol.encode(
            'WRONGTYPE Operation against a key holding the wrong kind of value'
        ),
        '-WRONGTYPE Operation against a key holding the wrong kind of value\r\n'
    );
});

test('protocol ignores undefined response', () => {
    assert.equal(
        protocol.encode(undefined),
        ''
    );
});

test('protocol encodes missing value', () => {
    assert.equal(
        protocol.encode(null),
        '$-1\r\n'
    );
});

test('protocol encodes list response', () => {
    assert.equal(
        protocol.encode([
            'Mayur',
            'Ram',
            'Rahul',
        ]),
        '*3\r\n' +
        '$5\r\nMayur\r\n' +
        '$3\r\nRam\r\n' +
        '$5\r\nRahul\r\n'
    );
});

test('protocol encodes integer response', () => {
    assert.equal(
        protocol.encode(1),
        ':1\r\n'
    );
});

test('protocol encodes negative integer response', () => {
    assert.equal(
        protocol.encode(-1),
        ':-1\r\n'
    );
});

test('protocol encodes unicode string using UTF-8 byte length', () => {
    const value = 'नमस्कार';

    const expectedLength = Buffer.byteLength(
        value,
        'utf8'
    );

    assert.equal(
        protocol.encode(value),
        `$${expectedLength}\r\n${value}\r\n`
    );
});

test('protocol encodes emoji using UTF-8 byte length', () => {
    const value = '😀';

    const expectedLength = Buffer.byteLength(
        value,
        'utf8'
    );

    assert.equal(
        protocol.encode(value),
        `$${expectedLength}\r\n${value}\r\n`
    );
});

test('protocol encodes Japanese string using UTF-8 byte length', () => {
    const value = 'こんにちは';

    const expectedLength = Buffer.byteLength(
        value,
        'utf8'
    );

    assert.equal(
        protocol.encode(value),
        `$${expectedLength}\r\n${value}\r\n`
    );
});