const test = require('node:test');
const assert = require('node:assert');

const Database = require('../src/database/database');
const CE = require('../src/commands/command-executer');

function createExecutor() {
    const db = new Database();
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

test("TYPE returns string for a string key", () => {
    const executor = createExecutor();
    executor.execute("SET name Mayur");
    assert.strictEqual(executor.execute("TYPE name"), "string");
});

test("TYPE returns none for a missing key", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("TYPE missing"), "none");
});

test("TYPE validates arguments", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("TYPE"), "ERR wrong number of arguments for TYPE command");
    assert.strictEqual(executor.execute("TYPE key extra"), "ERR wrong number of arguments for TYPE command");
});

test("SET support EX option to set expiration", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("SET session active EX 10"), "OK");
    const ttl = executor.execute("TTL session");
    assert.ok(ttl >= 1 && ttl <= 10);
});

test("SET EX requires seconds", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("SET key value EX"), "ERR syntax error");
});

test("SET EX rejects non-integer seconds", () => {
    const executor = createExecutor();

    assert.strictEqual(
        executor.execute("SET key value EX abc"),
        "ERR invalid expire time in 'SET' command"
    );
});

test("SET EX rejects decimal seconds", () => {
    const executor = createExecutor();

    assert.strictEqual(
        executor.execute("SET key value EX 1.5"),
        "ERR invalid expire time in 'SET' command"
    );
});

test("INCR increments an existing integer value", () => {
    const executor = createExecutor();
    executor.execute("SET counter 10");
    assert.strictEqual(executor.execute("INCR counter"), 11);
    assert.strictEqual(executor.execute("GET counter"), "11");
});

test("INCR create missing key with value 1", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("INCR counter"), 1);
    assert.strictEqual(executor.execute("GET counter"), "1");
});

test("INCR rejects non-integer values", () => {
    const executor = createExecutor();
    executor.execute("SET counter hello");
    assert.strictEqual(executor.execute("INCR counter"), "ERR value is not an integer or out of range");
});

test("INCR validates arguments", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("INCR"), "ERR wrong number of arguments for 'INCR' command");
    assert.strictEqual(executor.execute("INCR key extra"), "ERR wrong number of arguments for 'INCR' command");
});

test("DECR decrements an existing integer value", () => {
    const executor = createExecutor();
    executor.execute("SET counter 10");
    assert.strictEqual(executor.execute("DECR counter"), 9);
    assert.strictEqual(executor.execute("GET counter"), "9");
});

test("DECR create missing key with value -1", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("DECR counter"), -1);
    assert.strictEqual(executor.execute("GET counter"), "-1");
});

test("DECR rejects non-integer values", () => {
    const executor = createExecutor();
    executor.execute("SET counter hello");
    assert.strictEqual(executor.execute("DECR counter"), "ERR value is not an integer or out of range");
});

test("DECR validates arguments", () => {
    const executor = createExecutor();
    assert.strictEqual(executor.execute("DECR"), "ERR wrong number of arguments for 'DECR' command");
    assert.strictEqual(executor.execute("DECR key extra"), "ERR wrong number of arguments for 'DECR' command");
});

test("LPUSH creates a list and adds values", () => {
    const executor = createExecutor();

    const result = executor.execute("LPUSH fruits apple banana");

    assert.strictEqual(result, 2);
    assert.deepStrictEqual(
        executor.execute("LRANGE fruits 0 -1"),
        ["banana", "apple"]
    );
});

test("LPUSH adds values to the beginning of an existing list", () => {
    const executor = createExecutor();

    executor.execute("LPUSH fruits apple banana");

    const result = executor.execute("LPUSH fruits orange");

    assert.strictEqual(result, 3);
    assert.deepStrictEqual(
        executor.execute("LRANGE fruits 0 -1"),
        ["orange", "banana", "apple"]
    );
});

test("RPUSH creates a list and adds values", () => {
    const executor = createExecutor();

    const result = executor.execute("RPUSH fruits apple banana");

    assert.strictEqual(result, 2);
    assert.deepStrictEqual(
        executor.execute("LRANGE fruits 0 -1"),
        ["apple", "banana"]
    );
});

test("RPUSH adds values to the end of an existing list", () => {
    const executor = createExecutor();

    executor.execute("RPUSH fruits apple banana");

    const result = executor.execute("RPUSH fruits orange");

    assert.strictEqual(result, 3);
    assert.deepStrictEqual(
        executor.execute("LRANGE fruits 0 -1"),
        ["apple", "banana", "orange"]
    );
});

test("LPOP removes and returns the first value", () => {
    const executor = createExecutor();

    executor.execute("RPUSH fruits apple banana orange");

    assert.strictEqual(
        executor.execute("LPOP fruits"),
        "apple"
    );

    assert.deepStrictEqual(
        executor.execute("LRANGE fruits 0 -1"),
        ["banana", "orange"]
    );
});

test("RPOP removes and returns the last value", () => {
    const executor = createExecutor();

    executor.execute("RPUSH fruits apple banana orange");

    assert.strictEqual(
        executor.execute("RPOP fruits"),
        "orange"
    );

    assert.deepStrictEqual(
        executor.execute("LRANGE fruits 0 -1"),
        ["apple", "banana"]
    );
});

test("LPOP returns null for a missing list", () => {
    const executor = createExecutor();

    assert.strictEqual(
        executor.execute("LPOP missing"),
        null
    );
});

test("RPOP returns null for a missing list", () => {
    const executor = createExecutor();

    assert.strictEqual(
        executor.execute("RPOP missing"),
        null
    );
});

test("LRANGE returns the complete list", () => {
    const executor = createExecutor();

    executor.execute("RPUSH fruits apple banana orange");

    assert.deepStrictEqual(
        executor.execute("LRANGE fruits 0 -1"),
        ["apple", "banana", "orange"]
    );
});

test("LRANGE returns a range of list values", () => {
    const executor = createExecutor();

    executor.execute("RPUSH fruits apple banana orange");

    assert.deepStrictEqual(
        executor.execute("LRANGE fruits 0 1"),
        ["apple", "banana"]
    );
});