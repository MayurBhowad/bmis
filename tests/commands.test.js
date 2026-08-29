const test = require('node:test');
const assert = require('node:assert');

const database = require('../src/database/database');
const CE = require('../src/commands/command-executer');

function createExecutor() {
    const db = new database();
    return new CE(db);
}

test("Set command stores a value", () => {
    const executer = createExecutor();
    const result = executer.execute('SET name Mayur');
    assert.strictEqual(result, 'OK');
});

test("Get command retrieves a value", () => {
    const executer = createExecutor();
    executer.execute('SET name Mayur');
    const result = executer.execute('GET name');
    assert.strictEqual(result, 'Mayur');
});

test("Commands are case insensitive", () => {
    const executer = createExecutor();
    executer.execute('SET name Mayur');
    const result = executer.execute('get name');
    assert.strictEqual(result, 'Mayur');
});

test("Set supports value with spaces", () => {
    const executer = createExecutor();
    executer.execute('SET name Mayur Bhowad');
    const result = executer.execute('GET name');
    assert.strictEqual(result, 'Mayur Bhowad');
});

test("Unknow command returns an error", () => {
    const executer = createExecutor();
    const result = executer.execute('UNKNOWN');
    assert.strictEqual(result, 'ERR unknown command \'UNKNOWN\'');
});

test("SET validates missing arguments", () => {
    const executor = createExecutor();

    const result = executor.execute("SET name");

    assert.strictEqual(
        result,
        "ERR wrong number of arguments for SET command"
    );
});

test("GET validates missing arguments", () => {
    const executor = createExecutor();

    const result = executor.execute("GET");

    assert.strictEqual(
        result,
        "ERR wrong number of arguments for GET command"
    );
});

test("DEL validates missing arguments", () => {
    const executor = createExecutor();

    const result = executor.execute("DEL");

    assert.strictEqual(
        result,
        "ERR wrong number of arguments for DEL command"
    );
});

test("EXISTS validates missing arguments", () => {
    const executor = createExecutor();

    const result = executor.execute("EXISTS");

    assert.strictEqual(
        result,
        "ERR wrong number of arguments for EXISTS command"
    );
});

test("empty input is ignored", () => {
    const executor = createExecutor();

    const result = executor.execute("");

    assert.strictEqual(result, undefined);
});

test("DEL deletes multiple and returns the number of deleted keys", () => {
    const executor = createExecutor();

    executor.execute("SET name Mayur");
    executor.execute("SET city Mumbai");
    executor.execute("SET role Developer");

    const result = executor.execute("DEL name city missing");

    assert.strictEqual(result, 2);

    assert.strictEqual(executor.execute("GET name"), null);
    assert.strictEqual(executor.execute("GET city"), null);
    assert.strictEqual(executor.execute("GET role"), 'Developer');
});

test("EXISTS check multiple keys and returns the number of existing keys", () => {
    const executor = createExecutor();

    executor.execute("SET name Mayur");
    executor.execute("SET city Mumbai");
    executor.execute("SET role Developer");

    const result = executor.execute("EXISTS name city missing");

    assert.strictEqual(result, 2);
});

test("EXPIRE sets expiration on an existing key", () => {
    const executor = createExecutor();

    executor.execute("SET session active");
    const result = executor.execute("EXPIRE session 10");
    assert.strictEqual(result, 1);
});

test("EXPIRE returns 0 for a missing key", () => {
    const executor = createExecutor();

    const result = executor.execute("EXPIRE session 10");
    assert.strictEqual(result, 0);
});

test("EXPIRE validates missing arguments", () => {
    const executor = createExecutor();
  
    const result = executor.execute("EXPIRE");
  
    assert.strictEqual(
      result,
      "ERR wrong number of arguments for EXPIRE command"
    );
  });
  
  test("EXPIRE validates missing seconds", () => {
    const executor = createExecutor();
  
    const result = executor.execute("EXPIRE session");
  
    assert.strictEqual(
      result,
      "ERR wrong number of arguments for EXPIRE command"
    );
  });
  
  test("EXPIRE rejects non-integer seconds", () => {
    const executor = createExecutor();
  
    executor.execute("SET session active");
  
    const result = executor.execute("EXPIRE session abc");
  
    assert.strictEqual(
      result,
      "ERR value is not an integer or out of range"
    );
  });
  
  test("EXPIRE rejects decimal seconds", () => {
    const executor = createExecutor();
  
    executor.execute("SET session active");
  
    const result = executor.execute("EXPIRE session 1.5");
  
    assert.strictEqual(
      result,
      "ERR value is not an integer or out of range"
    );
});

test("TTL return -2 for missing key", () => {
    const executor = createExecutor();
    const result = executor.execute("TTL missing");
    assert.strictEqual(result, -2);
});

test("TTL return -1 for a key without expiration", () => {
    const executor = createExecutor();
    executor.execute("SET name Mayur");
    const result = executor.execute("TTL name");
    assert.strictEqual(result, -1);
});

test("TTL returns the remaining seconds for an expiring key", () => {
    const executor = createExecutor();
    executor.execute("SET session active");
    executor.execute("EXPIRE session 10");
    const result = executor.execute("TTL session");
    assert.ok(result >= 9);
    assert.ok(result <= 10);
});

test("TTL validates arguments", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("TTL"), "ERR wrong number of arguments for TTL command");
    assert.strictEqual(executor.execute("TTL key extra"), "ERR wrong number of arguments for TTL command");
});

test("EXPIRE with 0 immediately expires the key", () => {
    const executor = createExecutor();

    executor.execute("SET session active");

    assert.strictEqual(executor.execute("EXPIRE session 0"), 1);
    assert.strictEqual(executor.execute("GET session"), null);
    assert.strictEqual(executor.execute("EXISTS session"), 0);
    assert.strictEqual(executor.execute("TTL session"), -2);
});