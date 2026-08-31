const test = require('node:test');
const assert = require('node:assert');
const parse = require('../src/commands/parser');

test("parser extracts command and arguments", () => {
    const result = parse("SET name Mayur");
    assert.deepStrictEqual(result, { command: "SET", args: ["name", "Mayur"] });
});

test("parser converts command to uppercase", () => {
    const result = parse("get name");
    assert.deepStrictEqual(result, { command: "GET", args: ["name"] });
});

test("parser support multiple arguments", () => {
    const result = parse("del city name role");
    assert.deepStrictEqual(result, { command: "DEL", args: ["city", "name", "role"] });
});

test("parser handles extra spaces", () => {
    const result = parse("  del   city   name   role  ");
    assert.deepStrictEqual(result, { command: "DEL", args: ["city", "name", "role"] });
});

test("parser returns undefined for empty input", () => {
    const result = parse("");
    assert.strictEqual(result, undefined);
});

test("parser returns undefined for whitespace-only input", () => {
    const result = parse("  ");
    assert.strictEqual(result, undefined);
});